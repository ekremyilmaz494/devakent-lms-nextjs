import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma as db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "SUPER_ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Toplam hastane sayısı
    const totalHospitals = await db.hospital.count();

    // Aktif hastane sayısı
    const activeHospitals = await db.hospital.count({
      where: { isActive: true },
    });

    // Abonelik durumları
    const subscriptionStats = await db.hospitalSubscription.groupBy({
      by: ["status"],
      _count: true,
    });

    const activeSubscriptions = subscriptionStats.find((s) => s.status === "ACTIVE")?._count || 0;
    const suspendedSubscriptions = subscriptionStats.find((s) => s.status === "SUSPENDED")?._count || 0;

    // Toplam personel sayısı
    const totalStaff = await db.user.count({
      where: { role: "STAFF" },
    });

    // Aktif eğitim sayısı
    const activeTrainings = await db.training.count({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
      },
    });

    // Toplam gelir (abonelik planlarından)
    const subscriptions = await db.hospitalSubscription.findMany({
      where: { status: { in: ["ACTIVE", "TRIAL"] } },
      include: { plan: true },
    });
    const totalRevenue = subscriptions.reduce((sum, sub) => sum + sub.plan.price, 0);

    // Aylık yeni hastane trendi (son 6 ay)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const hospitalsByMonth = await db.hospital.groupBy({
      by: ["createdAt"],
      where: {
        createdAt: {
          gte: sixMonthsAgo,
        },
      },
      _count: true,
    });

    // Ay bazında gruplama
    const monthlyTrend = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.toLocaleDateString("tr-TR", { month: "short", year: "numeric" });
      const count = hospitalsByMonth.filter((h) => {
        const hMonth = new Date(h.createdAt).getMonth();
        const targetMonth = date.getMonth();
        return hMonth === targetMonth;
      }).length;
      return { month, count };
    });

    // Son kayıt olan 5 hastane
    const recentHospitals = await db.hospital.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        subscription: {
          include: { plan: true },
        },
        _count: {
          select: {
            users: { where: { role: "STAFF" } },
            trainings: { where: { deletedAt: null } },
          },
        },
      },
    });

    // Aboneliği sona yaklaşan 5 hastane
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    const expiringSubscriptions = await db.hospitalSubscription.findMany({
      where: {
        endDate: {
          lte: thirtyDaysFromNow,
          gte: new Date(),
        },
        status: { in: ["ACTIVE", "EXPIRING"] },
      },
      take: 5,
      orderBy: { endDate: "asc" },
      include: {
        hospital: true,
        plan: true,
      },
    });

    return NextResponse.json({
      stats: {
        totalHospitals,
        activeHospitals,
        activeSubscriptions,
        suspendedSubscriptions,
        totalStaff,
        activeTrainings,
        totalRevenue,
      },
      monthlyTrend,
      recentHospitals: recentHospitals.map((h) => ({
        id: h.id,
        name: h.name,
        code: h.code,
        city: h.city,
        createdAt: h.createdAt,
        staffCount: h._count.users,
        trainingCount: h._count.trainings,
        plan: h.subscription?.plan.name || "Plan Yok",
        status: h.subscription?.status || "NO_SUBSCRIPTION",
      })),
      expiringSubscriptions: expiringSubscriptions.map((sub) => ({
        id: sub.id,
        hospitalId: sub.hospital.id,
        hospitalName: sub.hospital.name,
        planName: sub.plan.name,
        endDate: sub.endDate,
        daysRemaining: Math.ceil(
          (sub.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
        ),
      })),
    });
  } catch (error) {
    console.error("Super admin dashboard error:", error);
    return NextResponse.json(
      { error: "Dashboard verileri yüklenemedi" },
      { status: 500 }
    );
  }
}
