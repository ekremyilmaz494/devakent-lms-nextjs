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

    // Platform-wide completion rates by hospital
    const hospitals = await db.hospital.findMany({
      where: { isActive: true },
      include: {
        trainings: {
          where: { deletedAt: null, status: "PUBLISHED" },
        },
        users: {
          where: { role: "STAFF", isActive: true },
        },
        _count: {
          select: {
            trainings: {
              where: { deletedAt: null, status: "PUBLISHED" },
            },
            users: {
              where: { role: "STAFF", isActive: true },
            },
          },
        },
      },
    });

    const hospitalStats = await Promise.all(
      hospitals.map(async (hospital) => {
        // Get enrollments for this hospital
        const enrollments = await db.trainingEnrollment.findMany({
          where: {
            training: {
              hospitalId: hospital.id,
            },
          },
        });

        const completedEnrollments = enrollments.filter(
          (e) => e.status === "COMPLETED"
        );
        const avgScore =
          completedEnrollments.length > 0
            ? completedEnrollments.reduce((sum, e) => sum + (e.score || 0), 0) /
              completedEnrollments.length
            : 0;

        const completionRate =
          enrollments.length > 0
            ? (completedEnrollments.length / enrollments.length) * 100
            : 0;

        return {
          hospitalId: hospital.id,
          hospitalName: hospital.name,
          hospitalCity: hospital.city,
          totalStaff: hospital._count.users,
          totalTrainings: hospital._count.trainings,
          totalEnrollments: enrollments.length,
          completedEnrollments: completedEnrollments.length,
          completionRate: Math.round(completionRate),
          avgScore: Math.round(avgScore),
        };
      })
    );

    // Most active hospitals (by enrollment activity)
    const mostActiveHospitals = hospitalStats
      .sort((a, b) => b.totalEnrollments - a.totalEnrollments)
      .slice(0, 10);

    // Training completion trends (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const completionsByMonth = await db.trainingEnrollment.groupBy({
      by: ["completedAt"],
      where: {
        status: "COMPLETED",
        completedAt: {
          gte: sixMonthsAgo,
          lte: new Date(),
        },
      },
      _count: true,
    });

    // Group by month
    const monthlyCompletions = Array.from({ length: 6 }, (_, i) => {
      const date = new Date();
      date.setMonth(date.getMonth() - (5 - i));
      const month = date.toLocaleDateString("tr-TR", {
        month: "short",
        year: "numeric",
      });
      const count = completionsByMonth.filter((c) => {
        if (!c.completedAt) return false;
        const cMonth = new Date(c.completedAt).getMonth();
        const targetMonth = date.getMonth();
        return cMonth === targetMonth;
      }).length;
      return { month, count };
    });

    // Overall platform statistics
    const totalEnrollments = await db.trainingEnrollment.count();
    const completedEnrollments = await db.trainingEnrollment.count({
      where: { status: "COMPLETED" },
    });
    const platformCompletionRate =
      totalEnrollments > 0
        ? Math.round((completedEnrollments / totalEnrollments) * 100)
        : 0;

    const completedWithScores = await db.trainingEnrollment.findMany({
      where: {
        status: "COMPLETED",
        score: { not: null },
      },
      select: { score: true },
    });

    const platformAvgScore =
      completedWithScores.length > 0
        ? Math.round(
            completedWithScores.reduce(
              (sum, e) => sum + (e.score || 0),
              0
            ) / completedWithScores.length
          )
        : 0;

    // Top performing trainings
    const trainings = await db.training.findMany({
      where: {
        status: "PUBLISHED",
        deletedAt: null,
      },
      include: {
        hospital: true,
        enrollments: {
          where: { status: "COMPLETED" },
        },
      },
      take: 10,
    });

    const topTrainings = trainings
      .map((t) => ({
        id: t.id,
        title: t.title,
        hospitalName: t.hospital.name,
        completions: t.enrollments.length,
        avgScore:
          t.enrollments.length > 0
            ? Math.round(
                t.enrollments.reduce(
                  (sum, e) => sum + (e.score || 0),
                  0
                ) / t.enrollments.length
              )
            : 0,
      }))
      .sort((a, b) => b.completions - a.completions)
      .slice(0, 10);

    return NextResponse.json({
      platformStats: {
        totalEnrollments,
        completedEnrollments,
        completionRate: platformCompletionRate,
        avgScore: platformAvgScore,
      },
      hospitalStats,
      mostActiveHospitals,
      monthlyCompletions,
      topTrainings,
    });
  } catch (error) {
    console.error("Reports GET error:", error);
    return NextResponse.json(
      { error: "Raporlar yüklenemedi" },
      { status: 500 }
    );
  }
}
