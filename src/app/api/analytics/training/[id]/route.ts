import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdmin = session.user.role === "ADMIN";
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { id: trainingId } = await params;

    // Eğitim bilgilerini getir
    const training = await db.training.findUnique({
      where: {
        id: trainingId,
        deletedAt: null,
      },
      include: {
        hospital: {
          select: {
            id: true,
            name: true,
          },
        },
        _count: {
          select: {
            assignments: true,
            videos: true,
            questions: true,
          },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Training not found" },
        { status: 404 }
      );
    }

    // Yetki kontrolü (Admin sadece kendi hastanesini görebilir)
    if (
      !isSuperAdmin &&
      training.hospitalId !== session.user.hospitalId
    ) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Atama İstatistikleri
    const [
      totalAssignments,
      completedCount,
      inProgressCount,
      notStartedCount,
      failedCount,
      lockedCount,
    ] = await Promise.all([
      db.trainingAssignment.count({
        where: { trainingId, deletedAt: null },
      }),
      db.trainingAssignment.count({
        where: { trainingId, status: "passed", deletedAt: null },
      }),
      db.trainingAssignment.count({
        where: {
          trainingId,
          status: { in: ["in_progress", "ready_for_exam"] },
          deletedAt: null,
        },
      }),
      db.trainingAssignment.count({
        where: { trainingId, status: "assigned", deletedAt: null },
      }),
      db.trainingAssignment.count({
        where: { trainingId, status: "failed", deletedAt: null },
      }),
      db.trainingAssignment.count({
        where: { trainingId, status: "locked", deletedAt: null },
      }),
    ]);

    const completionRate =
      totalAssignments > 0
        ? Math.round((completedCount / totalAssignments) * 100)
        : 0;

    // 2. Sınav İstatistikleri
    const examAttempts = await db.examAttempt.findMany({
      where: {
        trainingId,
        status: "COMPLETED",
      },
      select: {
        score: true,
        isPassed: true,
        attemptNumber: true,
      },
    });

    const totalExams = examAttempts.length;
    const passedExams = examAttempts.filter((e) => e.isPassed).length;
    const averageScore =
      totalExams > 0
        ? Math.round(
            examAttempts.reduce((sum, e) => sum + (e.score || 0), 0) /
              totalExams
          )
        : 0;

    const examPassRate =
      totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0;

    // Sınav puan dağılımı
    const scoreDistribution = {
      "0-40": examAttempts.filter((e) => (e.score || 0) < 40).length,
      "40-60": examAttempts.filter(
        (e) => (e.score || 0) >= 40 && (e.score || 0) < 60
      ).length,
      "60-80": examAttempts.filter(
        (e) => (e.score || 0) >= 60 && (e.score || 0) < 80
      ).length,
      "80-100": examAttempts.filter((e) => (e.score || 0) >= 80).length,
    };

    // 3. Video İzleme İstatistikleri
    const videoProgress = await db.videoProgress.findMany({
      where: {
        video: {
          trainingId,
        },
      },
      select: {
        videoId: true,
        completed: true,
        watchPercentage: true,
      },
    });

    const totalVideoViews = videoProgress.length;
    const completedVideoViews = videoProgress.filter((v) => v.completed).length;
    const videoCompletionRate =
      totalVideoViews > 0
        ? Math.round((completedVideoViews / totalVideoViews) * 100)
        : 0;

    const averageWatchPercentage =
      totalVideoViews > 0
        ? Math.round(
            videoProgress.reduce((sum, v) => sum + v.watchPercentage, 0) /
              totalVideoViews
          )
        : 0;

    // 4. Videoya göre tamamlanma oranı
    const videoStats = await db.trainingVideo.findMany({
      where: {
        trainingId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        sortOrder: true,
        _count: {
          select: {
            progress: true,
          },
        },
        progress: {
          where: {
            completed: true,
          },
          select: {
            id: true,
          },
        },
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    const videoCompletionData = videoStats.map((video) => ({
      videoTitle: video.title,
      totalViews: video._count.progress,
      completedViews: video.progress.length,
      completionRate:
        video._count.progress > 0
          ? Math.round((video.progress.length / video._count.progress) * 100)
          : 0,
    }));

    // 5. Zaman içinde ilerleme (son 30 gün)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentActivity = await db.trainingAssignment.findMany({
      where: {
        trainingId,
        deletedAt: null,
        OR: [
          {
            startedAt: {
              gte: thirtyDaysAgo,
            },
          },
          {
            completedAt: {
              gte: thirtyDaysAgo,
            },
          },
        ],
      },
      select: {
        startedAt: true,
        completedAt: true,
        status: true,
      },
    });

    // Günlük başlangıç ve tamamlanma sayıları
    const dailyStats: Record<
      string,
      { started: number; completed: number }
    > = {};

    recentActivity.forEach((item) => {
      if (item.startedAt && item.startedAt >= thirtyDaysAgo) {
        const date = item.startedAt.toISOString().split("T")[0];
        if (!dailyStats[date]) dailyStats[date] = { started: 0, completed: 0 };
        dailyStats[date].started++;
      }

      if (item.completedAt && item.completedAt >= thirtyDaysAgo) {
        const date = item.completedAt.toISOString().split("T")[0];
        if (!dailyStats[date]) dailyStats[date] = { started: 0, completed: 0 };
        dailyStats[date].completed++;
      }
    });

    const progressOverTime = Object.entries(dailyStats)
      .map(([date, stats]) => ({
        date,
        started: stats.started,
        completed: stats.completed,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));

    // 6. Departmana göre performans (eğer personel bilgisi varsa)
    const departmentStats = await db.trainingAssignment.findMany({
      where: {
        trainingId,
        deletedAt: null,
      },
      include: {
        user: {
          select: {
            department: true,
          },
        },
      },
    });

    const departmentPerformance = departmentStats.reduce((acc, assignment) => {
      const dept = assignment.user.department || "Belirtilmemiş";
      if (!acc[dept]) {
        acc[dept] = { total: 0, completed: 0 };
      }
      acc[dept].total++;
      if (assignment.status === "passed") {
        acc[dept].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);

    const departmentData = Object.entries(departmentPerformance).map(
      ([department, stats]) => ({
        department,
        total: stats.total,
        completed: stats.completed,
        completionRate:
          stats.total > 0
            ? Math.round((stats.completed / stats.total) * 100)
            : 0,
      })
    );

    return NextResponse.json({
      training: {
        id: training.id,
        title: training.title,
        status: training.status,
        passingScore: training.passingScore,
        videoCount: training._count.videos,
        questionCount: training._count.questions,
        hospital: training.hospital.name,
      },
      assignments: {
        total: totalAssignments,
        completed: completedCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        failed: failedCount,
        locked: lockedCount,
        completionRate,
      },
      exams: {
        totalAttempts: totalExams,
        passed: passedExams,
        failed: totalExams - passedExams,
        averageScore,
        passRate: examPassRate,
        scoreDistribution,
      },
      videos: {
        totalViews: totalVideoViews,
        completedViews: completedVideoViews,
        completionRate: videoCompletionRate,
        averageWatchPercentage,
        videoCompletionData,
      },
      progressOverTime,
      departmentPerformance: departmentData,
    });
  } catch (error) {
    console.error("Error fetching training analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
