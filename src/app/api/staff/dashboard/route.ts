import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    if (session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const userId = session.user.id;

    // Get all assignments for this user
    const assignments = await db.trainingAssignment.findMany({
      where: {
        userId,
        deletedAt: null,
      },
      include: {
        training: {
          select: {
            id: true,
            title: true,
            description: true,
            thumbnail: true,
            category: true,
            endDate: true,
            passingScore: true,
            _count: {
              select: {
                videos: true,
              },
            },
          },
        },
        videoProgress: {
          where: {
            completed: true,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        assignedAt: "desc",
      },
    });

    // Calculate stats
    const totalAssignments = assignments.length;
    const completed = assignments.filter((a) => a.status === "passed").length;
    const inProgress = assignments.filter((a) =>
      ["in_progress", "ready_for_exam"].includes(a.status)
    ).length;
    const failed = assignments.filter((a) =>
      ["failed", "locked"].includes(a.status)
    ).length;

    // Get upcoming deadlines (trainings ending within 7 days)
    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const upcomingDeadlines = assignments
      .filter((a) => {
        const endDate = new Date(a.training.endDate);
        return (
          endDate >= now &&
          endDate <= sevenDaysFromNow &&
          a.status !== "passed"
        );
      })
      .map((a) => {
        const endDate = new Date(a.training.endDate);
        const daysRemaining = Math.ceil(
          (endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        );
        const totalVideos = a.training._count.videos;
        const completedVideos = a.videoProgress.length;

        return {
          id: a.id,
          trainingId: a.training.id,
          title: a.training.title,
          category: a.training.category,
          endDate: a.training.endDate,
          daysRemaining,
          status: a.status,
          progress: totalVideos > 0
            ? Math.round((completedVideos / totalVideos) * 100)
            : 0,
        };
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining);

    // Get recent activities (last 5 completed trainings)
    const recentActivities = assignments
      .filter((a) => a.status === "passed" && a.completedAt)
      .slice(0, 5)
      .map((a) => ({
        id: a.id,
        trainingId: a.training.id,
        title: a.training.title,
        completedAt: a.completedAt,
        category: a.training.category,
      }));

    // Get certificates
    const certificates = await db.certificate.findMany({
      where: {
        userId,
      },
      select: {
        id: true,
        certificateNo: true,
        status: true,
        createdAt: true,
        approvedAt: true,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    return NextResponse.json({
      stats: {
        total: totalAssignments,
        completed,
        inProgress,
        failed,
      },
      upcomingDeadlines,
      recentActivities,
      certificates,
    });
  } catch (error) {
    console.error("Error fetching staff dashboard:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
