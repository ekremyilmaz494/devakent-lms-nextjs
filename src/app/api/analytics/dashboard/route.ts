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

    // Admin ve Super Admin için farklı istatistikler
    const isAdmin = session.user.role === "ADMIN";
    const isSuperAdmin = session.user.role === "SUPER_ADMIN";

    if (!isAdmin && !isSuperAdmin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const hospitalId = session.user.hospitalId;

    // Super Admin tüm hastaneleri görür, Admin sadece kendi hastanesini
    const hospitalFilter = isSuperAdmin ? {} : hospitalId ? { hospitalId } : {};

    // 1. Toplam İstatistikler
    const [
      totalTrainings,
      activeTrainings,
      totalStaff,
      totalAssignments,
      completedAssignments,
      inProgressAssignments,
    ] = await Promise.all([
      // Toplam eğitim sayısı
      db.training.count({
        where: {
          ...hospitalFilter,
          deletedAt: null,
        },
      }),
      // Aktif eğitimler (yayında olanlar)
      db.training.count({
        where: {
          ...hospitalFilter,
          status: "PUBLISHED",
          deletedAt: null,
          startDate: { lte: new Date() },
          endDate: { gte: new Date() },
        },
      }),
      // Toplam personel
      db.user.count({
        where: {
          ...hospitalFilter,
          role: "STAFF",
          isActive: true,
        },
      }),
      // Toplam atama
      db.trainingAssignment.count({
        where: {
          deletedAt: null,
          training: {
            ...hospitalFilter,
          },
        },
      }),
      // Tamamlanan atamalar
      db.trainingAssignment.count({
        where: {
          status: "passed",
          deletedAt: null,
          training: {
            ...hospitalFilter,
          },
        },
      }),
      // Devam eden atamalar
      db.trainingAssignment.count({
        where: {
          status: { in: ["in_progress", "ready_for_exam"] },
          deletedAt: null,
          training: {
            ...hospitalFilter,
          },
        },
      }),
    ]);

    // 2. Tamamlanma oranı
    const completionRate =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    // 3. Son 30 günlük aktivite (günlük tamamlanan eğitimler)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentCompletions = await db.trainingAssignment.findMany({
      where: {
        status: "passed",
        completedAt: {
          gte: thirtyDaysAgo,
        },
        deletedAt: null,
        training: {
          ...hospitalFilter,
        },
      },
      select: {
        completedAt: true,
      },
    });

    // Günlük gruplama
    const dailyCompletions = recentCompletions.reduce((acc, item) => {
      if (!item.completedAt) return acc;
      const date = item.completedAt.toISOString().split("T")[0];
      acc[date] = (acc[date] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const activityData = Object.entries(dailyCompletions)
      .map(([date, count]) => ({
        date,
        completions: count,
      }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-30); // Son 30 gün

    // 4. En popüler eğitimler (en çok atama yapılan)
    const popularTrainings = await db.training.findMany({
      where: {
        ...hospitalFilter,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        _count: {
          select: {
            assignments: true,
          },
        },
      },
      orderBy: {
        assignments: {
          _count: "desc",
        },
      },
      take: 5,
    });

    // 5. Kategoriye göre eğitim dağılımı
    const categoryDistribution = await db.training.groupBy({
      by: ["category"],
      where: {
        ...hospitalFilter,
        deletedAt: null,
      },
      _count: {
        category: true,
      },
    });

    // 6. Personel performans özeti (en başarılı personeller)
    const topPerformers = await db.user.findMany({
      where: {
        ...hospitalFilter,
        role: "STAFF",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        assignments: {
          where: {
            status: "passed",
            deletedAt: null,
          },
          select: {
            id: true,
          },
        },
      },
      take: 10,
    });

    const topPerformersData = topPerformers
      .map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        department: user.department,
        completedTrainings: user.assignments.length,
      }))
      .filter((user) => user.completedTrainings > 0)
      .sort((a, b) => b.completedTrainings - a.completedTrainings)
      .slice(0, 5);

    // 7. Sertifika durumu
    const [pendingCertificates, approvedCertificates] = await Promise.all([
      db.certificate.count({
        where: {
          status: "PENDING",
          user: {
            ...hospitalFilter,
          },
        },
      }),
      db.certificate.count({
        where: {
          status: "APPROVED",
          user: {
            ...hospitalFilter,
          },
        },
      }),
    ]);

    // 8. Başarısızlık oranı
    const failedAssignments = await db.trainingAssignment.count({
      where: {
        status: { in: ["failed", "locked"] },
        deletedAt: null,
        training: {
          ...hospitalFilter,
        },
      },
    });

    const failureRate =
      totalAssignments > 0
        ? Math.round((failedAssignments / totalAssignments) * 100)
        : 0;

    return NextResponse.json({
      overview: {
        totalTrainings,
        activeTrainings,
        totalStaff,
        totalAssignments,
        completedAssignments,
        inProgressAssignments,
        completionRate,
        failureRate,
      },
      certificates: {
        pending: pendingCertificates,
        approved: approvedCertificates,
      },
      activity: activityData,
      popularTrainings: popularTrainings.map((t) => ({
        id: t.id,
        title: t.title,
        assignmentCount: t._count.assignments,
      })),
      categoryDistribution: categoryDistribution.map((c) => ({
        category: c.category || "Kategori Yok",
        count: c._count.category,
      })),
      topPerformers: topPerformersData,
    });
  } catch (error) {
    console.error("Error fetching dashboard analytics:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
