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
    const isStaff = session.user.role === "STAFF";

    // Personel sadece kendi bilgilerini, admin/super_admin herkesin bilgisini görebilir
    const { id: staffId } = await params;

    if (isStaff && staffId !== session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Personel bilgilerini getir
    const staff = await db.user.findUnique({
      where: {
        id: staffId,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        tcNo: true,
        title: true,
        department: true,
        phone: true,
        avatarUrl: true,
        isActive: true,
        createdAt: true,
        lastLoginAt: true,
        hospitalId: true,
        hospital: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 404 });
    }

    // Role kontrolü - sadece STAFF rolündeki kullanıcılar
    if (staff.role !== "STAFF") {
      return NextResponse.json({ error: "Not a staff member" }, { status: 400 });
    }

    // Yetki kontrolü (Admin sadece kendi hastanesindeki personeli görebilir)
    if (!isSuperAdmin && staff.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // 1. Genel İstatistikler
    const [
      totalAssignments,
      completedCount,
      inProgressCount,
      notStartedCount,
      failedCount,
    ] = await Promise.all([
      db.trainingAssignment.count({
        where: { userId: staffId, deletedAt: null },
      }),
      db.trainingAssignment.count({
        where: { userId: staffId, status: "passed", deletedAt: null },
      }),
      db.trainingAssignment.count({
        where: {
          userId: staffId,
          status: { in: ["in_progress", "ready_for_exam"] },
          deletedAt: null,
        },
      }),
      db.trainingAssignment.count({
        where: { userId: staffId, status: "assigned", deletedAt: null },
      }),
      db.trainingAssignment.count({
        where: {
          userId: staffId,
          status: { in: ["failed", "locked"] },
          deletedAt: null,
        },
      }),
    ]);

    const completionRate =
      totalAssignments > 0
        ? Math.round((completedCount / totalAssignments) * 100)
        : 0;

    // 2. Sınav Performansı
    const examAttempts = await db.examAttempt.findMany({
      where: {
        userId: staffId,
        status: "COMPLETED",
      },
      select: {
        score: true,
        isPassed: true,
        attemptNumber: true,
        completedAt: true,
        trainingId: true,
        assignment: {
          select: {
            training: {
              select: {
                title: true,
                passingScore: true,
              },
            },
          },
        },
      },
      orderBy: {
        completedAt: "desc",
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

    // Son 5 sınav sonucu
    const recentExams = examAttempts.slice(0, 5).map((exam) => ({
      trainingTitle: exam.assignment.training.title,
      score: exam.score,
      isPassed: exam.isPassed,
      passingScore: exam.assignment.training.passingScore,
      attemptNumber: exam.attemptNumber,
      completedAt: exam.completedAt,
    }));

    // 3. Video İzleme Aktivitesi
    const videoProgress = await db.videoProgress.findMany({
      where: {
        assignment: {
          userId: staffId,
        },
      },
      select: {
        completed: true,
        watchedSeconds: true,
        lastWatchedAt: true,
      },
    });

    const totalVideosWatched = videoProgress.length;
    const completedVideos = videoProgress.filter((v) => v.completed).length;
    const totalWatchTimeMinutes = Math.round(
      videoProgress.reduce((sum, v) => sum + v.watchedSeconds, 0) / 60
    );

    // 4. Zaman İçinde İlerleme (son 90 gün)
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    const recentAssignments = await db.trainingAssignment.findMany({
      where: {
        userId: staffId,
        deletedAt: null,
        OR: [
          {
            startedAt: {
              gte: ninetyDaysAgo,
            },
          },
          {
            completedAt: {
              gte: ninetyDaysAgo,
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

    // Aylık gruplama
    const monthlyProgress: Record<
      string,
      { started: number; completed: number }
    > = {};

    recentAssignments.forEach((item) => {
      if (item.startedAt && item.startedAt >= ninetyDaysAgo) {
        const month = item.startedAt.toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyProgress[month])
          monthlyProgress[month] = { started: 0, completed: 0 };
        monthlyProgress[month].started++;
      }

      if (item.completedAt && item.completedAt >= ninetyDaysAgo) {
        const month = item.completedAt.toISOString().slice(0, 7); // YYYY-MM
        if (!monthlyProgress[month])
          monthlyProgress[month] = { started: 0, completed: 0 };
        monthlyProgress[month].completed++;
      }
    });

    const progressOverTime = Object.entries(monthlyProgress)
      .map(([month, stats]) => ({
        month,
        started: stats.started,
        completed: stats.completed,
      }))
      .sort((a, b) => a.month.localeCompare(b.month));

    // 5. Tüm Eğitim Atamaları ve Tüm Deneme Skorları
    const allAssignments = await db.trainingAssignment.findMany({
      where: {
        userId: staffId,
        deletedAt: null,
      },
      include: {
        training: {
          select: {
            id: true,
            title: true,
            category: true,
            passingScore: true,
          },
        },
        examAttempts: {
          where: {
            status: "COMPLETED",
          },
          select: {
            id: true,
            score: true,
            isPassed: true,
            attemptNumber: true,
            completedAt: true,
          },
          orderBy: {
            attemptNumber: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    const completedTrainingsList = allAssignments
      .filter((a) => a.status === "passed")
      .map((assignment) => ({
        trainingId: assignment.training.id,
        trainingTitle: assignment.training.title,
        category: assignment.training.category,
        completedAt: assignment.completedAt,
        passingScore: assignment.training.passingScore,
        examScore: assignment.examAttempts.find((e) => e.isPassed)?.score || null,
        examAttempts: assignment.examAttempts.length,
        allAttempts: assignment.examAttempts.map((attempt) => ({
          attemptNumber: attempt.attemptNumber,
          score: attempt.score,
          isPassed: attempt.isPassed,
          completedAt: attempt.completedAt,
        })),
      }));

    // Tüm atamaları da döndür (kilitli olanlar için "Yeni Deneme Hakkı Ver" butonu için)
    const allAssignmentsList = allAssignments.map((assignment) => ({
      id: assignment.id,
      trainingId: assignment.training.id,
      trainingTitle: assignment.training.title,
      status: assignment.status,
      currentAttempt: assignment.currentAttempt,
      maxAttempts: assignment.maxAttempts,
      category: assignment.training.category,
      assignedAt: assignment.assignedAt,
      completedAt: assignment.completedAt,
      passingScore: assignment.training.passingScore,
      allAttempts: assignment.examAttempts.map((attempt) => ({
        attemptNumber: attempt.attemptNumber,
        score: attempt.score,
        isPassed: attempt.isPassed,
        completedAt: attempt.completedAt,
      })),
    }));

    // 6. Kategoriye göre performans
    const categoryPerformance = allAssignments
      .filter((a) => a.status === "passed")
      .reduce((acc, assignment) => {
        const category = assignment.training.category || "Belirtilmemiş";
        if (!acc[category]) {
          acc[category] = { count: 0, totalScore: 0, avgScore: 0 };
        }
        acc[category].count++;
        const score = assignment.examAttempts.find((e) => e.isPassed)?.score || 0;
        acc[category].totalScore += score;
        return acc;
      }, {} as Record<string, { count: number; totalScore: number; avgScore: number }>);

    Object.keys(categoryPerformance).forEach((category) => {
      const data = categoryPerformance[category];
      data.avgScore =
        data.count > 0 ? Math.round(data.totalScore / data.count) : 0;
    });

    const categoryData = Object.entries(categoryPerformance).map(
      ([category, data]) => ({
        category,
        completedCount: data.count,
        averageScore: data.avgScore,
      })
    );

    // 7. Sertifikalar
    const certificates = await db.certificate.findMany({
      where: {
        userId: staffId,
      },
      select: {
        id: true,
        certificateNo: true,
        status: true,
        createdAt: true,
        approvedAt: true,
        pdfUrl: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json({
      staff: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        tcNo: staff.tcNo,
        title: staff.title,
        department: staff.department,
        phone: staff.phone,
        avatarUrl: staff.avatarUrl,
        isActive: staff.isActive,
        hospital: staff.hospital?.name,
        joinedAt: staff.createdAt,
        lastLoginAt: staff.lastLoginAt,
      },
      overview: {
        totalAssignments,
        completed: completedCount,
        inProgress: inProgressCount,
        notStarted: notStartedCount,
        failed: failedCount,
        completionRate,
      },
      examPerformance: {
        totalExams,
        passed: passedExams,
        failed: totalExams - passedExams,
        averageScore,
        passRate: examPassRate,
        recentExams,
      },
      videoActivity: {
        totalVideosWatched,
        completedVideos,
        totalWatchTimeMinutes,
      },
      progressOverTime,
      completedTrainings: completedTrainingsList,
      allAssignments: allAssignmentsList,
      categoryPerformance: categoryData,
      certificates: certificates.map((cert) => ({
        id: cert.id,
        certificateNo: cert.certificateNo,
        status: cert.status,
        createdAt: cert.createdAt,
        approvedAt: cert.approvedAt,
        pdfUrl: cert.pdfUrl,
      })),
    });
  } catch (error) {
    console.error("Error fetching staff analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
