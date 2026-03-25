import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/staff/my-trainings - Get current user's training assignments
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const statusFilter = searchParams.get("status");
    const categoryFilter = searchParams.get("category");

    // Build where clause
    const where: any = {
      userId: session.user.id,
    };

    if (statusFilter && statusFilter !== "all") {
      where.status = statusFilter;
    }

    if (categoryFilter && categoryFilter !== "all") {
      where.training = {
        category: categoryFilter,
      };
    }

    const assignments = await prisma.trainingAssignment.findMany({
      where,
      include: {
        training: {
          include: {
            _count: {
              select: {
                videos: true,
                questions: true,
              },
            },
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
          take: 1, // Latest attempt only for list view
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    // Transform data for frontend
    const transformedAssignments = assignments.map((assignment) => {
      const latestAttempt = assignment.examAttempts[0];

      // Calculate progress
      let progress = 0;
      if (assignment.status === "in_progress") {
        progress = 50; // Arbitrary - videos being watched
      } else if (assignment.status === "passed") {
        progress = 100;
      }

      return {
        id: assignment.id,
        trainingId: assignment.trainingId,
        status: assignment.status,
        currentAttempt: assignment.currentAttempt,
        maxAttempts: assignment.maxAttempts,
        assignedAt: assignment.assignedAt,
        completedAt: assignment.completedAt,
        progress,
        latestScore: latestAttempt?.score || null,
        latestIsPassed: latestAttempt?.isPassed || false,
        training: {
          id: assignment.training.id,
          title: assignment.training.title,
          description: assignment.training.description,
          thumbnail: assignment.training.thumbnail,
          category: assignment.training.category,
          passingScore: assignment.training.passingScore,
          examDuration: assignment.training.examDuration,
          startDate: assignment.training.startDate,
          endDate: assignment.training.endDate,
          _count: {
            videos: assignment.training._count.videos,
            questions: assignment.training._count.questions,
          },
        },
      };
    });

    return NextResponse.json(transformedAssignments);
  } catch (error) {
    console.error("Error fetching my trainings:", error);
    return NextResponse.json(
      { error: "Eğitimler yüklenemedi" },
      { status: 500 }
    );
  }
}
