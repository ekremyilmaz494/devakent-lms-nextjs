import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/trainings/[id]/assignments - Get all assignments for a training
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: trainingId } = await params;

    // Get assignments with user details and attempt history
    const assignments = await prisma.trainingAssignment.findMany({
      where: {
        trainingId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            department: true,
            avatarUrl: true,
          },
        },
        examAttempts: {
          select: {
            id: true,
            attemptNumber: true,
            score: true,
            isPassed: true,
            status: true,
            completedAt: true,
          },
          orderBy: {
            attemptNumber: "desc",
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    // Transform data for frontend
    const assignmentsData = assignments.map((assignment) => {
      const latestAttempt = assignment.examAttempts[0];
      const firstAttempt = assignment.examAttempts[assignment.examAttempts.length - 1];

      return {
        id: assignment.id,
        user: assignment.user,
        status: assignment.status,
        currentAttempt: assignment.currentAttempt,
        maxAttempts: assignment.maxAttempts,
        assignedAt: assignment.assignedAt,
        completedAt: assignment.completedAt,
        latestScore: latestAttempt?.score ?? null,
        firstScore: firstAttempt?.score ?? null,
        isPassed: latestAttempt?.isPassed || false,
        totalAttempts: assignment.examAttempts.length,
        lastActivityAt: latestAttempt?.completedAt || assignment.assignedAt,
        averageScore:
          assignment.examAttempts.length > 0
            ? Math.round(
                assignment.examAttempts.reduce((sum, a) => sum + (a.score || 0), 0) /
                  assignment.examAttempts.length
              )
            : 0,
      };
    });

    // Calculate summary stats
    const summary = {
      total: assignments.length,
      assigned: assignments.filter((a) => a.status === "assigned").length,
      inProgress: assignments.filter((a) => a.status === "in_progress").length,
      passed: assignments.filter((a) => a.status === "passed").length,
      failed: assignments.filter((a) => a.status === "failed").length,
      locked: assignments.filter((a) => a.status === "locked").length,
      completionRate:
        assignments.length > 0
          ? Math.round(
              (assignments.filter(
                (a) => a.status === "passed" || a.status === "failed"
              ).length /
                assignments.length) *
                100
            )
          : 0,
      averageScore:
        assignmentsData.length > 0
          ? Math.round(
              assignmentsData.reduce((sum, a) => sum + (a.latestScore || 0), 0) /
                assignmentsData.length
            )
          : 0,
    };

    return NextResponse.json({
      assignments: assignmentsData,
      summary,
    });
  } catch (error) {
    console.error("Error fetching training assignments:", error);
    return NextResponse.json(
      { error: "Atamalar yüklenemedi" },
      { status: 500 }
    );
  }
}
