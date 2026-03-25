import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Get staff member's training assignments
    const assignments = await db.trainingAssignment.findMany({
      where: {
        userId: session.user.id,
        deletedAt: null,
      },
      include: {
        training: {
          select: {
            id: true,
            title: true,
            description: true,
            startDate: true,
            endDate: true,
            passingScore: true,
          },
        },
        examAttempts: {
          where: {
            status: "COMPLETED",
            isPassed: true,
          },
          select: {
            score: true,
            completedAt: true,
          },
          orderBy: {
            completedAt: "desc",
          },
          take: 1,
        },
      },
    });

    // Transform to FullCalendar event format
    const events = assignments.map((assignment) => {
      const training = assignment.training;
      const lastPassedExam = assignment.examAttempts[0];

      // Determine color based on assignment status
      let color = "#gray";
      let displayStatus = "pending";

      if (assignment.status === "passed") {
        color = "#22c55e"; // green
        displayStatus = "completed";
      } else if (assignment.status === "in_progress" || assignment.status === "ready_for_exam") {
        color = "#f97316"; // orange
        displayStatus = "in_progress";
      } else if (assignment.status === "assigned") {
        const now = new Date();
        const daysUntilEnd = Math.ceil(
          (training.endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (daysUntilEnd <= 7) {
          color = "#ef4444"; // red - deadline approaching
          displayStatus = "deadline_approaching";
        } else {
          color = "#3b82f6"; // blue
          displayStatus = "not_started";
        }
      } else if (assignment.status === "locked" || assignment.status === "failed") {
        color = "#6b7280"; // gray - locked
        displayStatus = "locked";
      }

      return {
        id: training.id,
        title: training.title,
        start: training.startDate.toISOString(),
        end: training.endDate.toISOString(),
        backgroundColor: color,
        borderColor: color,
        extendedProps: {
          description: training.description,
          status: displayStatus,
          score: lastPassedExam?.score || null,
          completedAt: assignment.completedAt || null,
          passingScore: training.passingScore,
          assignmentId: assignment.id,
          assignmentStatus: assignment.status,
          currentAttempt: assignment.currentAttempt,
          maxAttempts: assignment.maxAttempts,
        },
      };
    });

    return NextResponse.json({ events });
  } catch (error) {
    console.error("Calendar GET error:", error);
    return NextResponse.json(
      { error: "Takvim verileri yüklenemedi" },
      { status: 500 }
    );
  }
}
