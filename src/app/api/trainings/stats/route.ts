import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/trainings/stats - Eğitim istatistikleri
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const hospitalId = session.user.role === "ADMIN" ? session.user.hospitalId : null;

    const where: any = {
      deletedAt: null,
    };

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    // Paralel olarak tüm istatistikleri çek
    const [
      totalTrainings,
      draftTrainings,
      publishedTrainings,
      archivedTrainings,
      totalAssignments,
      completedAssignments,
    ] = await Promise.all([
      prisma.training.count({ where }),
      prisma.training.count({ where: { ...where, status: "DRAFT" } }),
      prisma.training.count({ where: { ...where, status: "PUBLISHED" } }),
      prisma.training.count({ where: { ...where, status: "ARCHIVED" } }),
      prisma.trainingAssignment.count({
        where: hospitalId
          ? {
              training: {
                hospitalId,
                deletedAt: null,
              },
            }
          : undefined,
      }),
      prisma.trainingAssignment.count({
        where: hospitalId
          ? {
              status: { in: ["passed", "failed"] },
              training: {
                hospitalId,
                deletedAt: null,
              },
            }
          : { status: { in: ["passed", "failed"] } },
      }),
    ]);

    const completionRate =
      totalAssignments > 0
        ? Math.round((completedAssignments / totalAssignments) * 100)
        : 0;

    // Ortalama puan hesapla (başarılı olan assignmentlar için)
    const successfulAttempts = await prisma.examAttempt.findMany({
      where: {
        isPassed: true,
        ...(hospitalId
          ? {
              user: {
                hospitalId,
              },
            }
          : {}),
      },
      select: {
        score: true,
      },
    });

    const averageScore =
      successfulAttempts.length > 0
        ? Math.round(
            successfulAttempts.reduce(
              (sum, attempt) => sum + (attempt.score || 0),
              0
            ) / successfulAttempts.length
          )
        : 0;

    return NextResponse.json({
      totalTrainings,
      draftTrainings,
      publishedTrainings,
      archivedTrainings,
      totalAssignments,
      completedAssignments,
      averageCompletionRate: completionRate,
      averageScore,
    });
  } catch (error) {
    console.error("Error fetching training stats:", error);
    return NextResponse.json(
      { error: "İstatistikler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
