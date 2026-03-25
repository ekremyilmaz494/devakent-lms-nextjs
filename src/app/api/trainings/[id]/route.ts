import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/trainings/[id] - Tek bir eğitimi getir
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    const training = await prisma.training.findUnique({
      where: { id },
      include: {
        videos: {
          orderBy: { sortOrder: "asc" },
        },
        questions: {
          include: {
            options: {
              orderBy: { sortOrder: "asc" },
            },
          },
          orderBy: { sortOrder: "asc" },
        },
        assignments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                department: true,
              },
            },
          },
        },
        _count: {
          select: {
            videos: true,
            questions: true,
            assignments: true,
          },
        },
      },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Eğitim bulunamadı" },
        { status: 404 }
      );
    }

    // ADMIN sadece kendi hastanesine ait eğitimleri görebilir
    if (
      session.user.role === "ADMIN" &&
      training.hospitalId !== session.user.hospitalId
    ) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    return NextResponse.json(training);
  } catch (error) {
    console.error("Error fetching training:", error);
    return NextResponse.json(
      { error: "Eğitim yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// PUT /api/trainings/[id] - Eğitimi güncelle
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;
    const body = await request.json();

    // Mevcut eğitimi kontrol et
    const existingTraining = await prisma.training.findUnique({
      where: { id },
    });

    if (!existingTraining) {
      return NextResponse.json(
        { error: "Eğitim bulunamadı" },
        { status: 404 }
      );
    }

    if (existingTraining.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    const { info, videos, questions } = body;

    // Transaction ile güncelle
    const updatedTraining = await prisma.$transaction(async (tx) => {
      // 1. Training güncelle
      const training = await tx.training.update({
        where: { id },
        data: {
          title: info?.title,
          description: info?.description,
          thumbnail: info?.thumbnail,
          category: info?.category,
          passingScore: info?.passingScore,
          maxAttempts: info?.maxAttempts,
          examDuration: info?.examDuration,
          startDate: info?.startDate ? new Date(info.startDate) : undefined,
          endDate: info?.endDate ? new Date(info.endDate) : undefined,
          status: info?.status,
        },
      });

      // 2. Videos güncelle (varsa)
      if (videos?.videos) {
        // Mevcut videoları sil
        await tx.trainingVideo.deleteMany({
          where: { trainingId: id },
        });

        // Yeni videoları ekle
        if (videos.videos.length > 0) {
          await tx.trainingVideo.createMany({
            data: videos.videos.map((video: any, index: number) => ({
              trainingId: id,
              title: video.title,
              description: video.description || null,
              videoUrl: video.videoUrl,
              videoKey: video.videoKey,
              durationSeconds: video.durationSeconds,
              sortOrder: video.sortOrder ?? index,
            })),
          });
        }
      }

      // 3. Questions güncelle (varsa)
      if (questions?.questions) {
        // Mevcut soruları ve şıkları sil
        await tx.question.deleteMany({
          where: { trainingId: id },
        });

        // Yeni soruları ekle
        if (questions.questions.length > 0) {
          for (const [index, question] of questions.questions.entries()) {
            const createdQuestion = await tx.question.create({
              data: {
                trainingId: id,
                questionText: question.questionText,
                questionType: question.questionType,
                points: question.points,
                sortOrder: question.sortOrder ?? index,
              },
            });

            if (question.options && question.options.length > 0) {
              await tx.questionOption.createMany({
                data: question.options.map((option: any, optIndex: number) => ({
                  questionId: createdQuestion.id,
                  optionText: option.optionText,
                  isCorrect: option.isCorrect,
                  sortOrder: option.sortOrder ?? optIndex,
                })),
              });
            }
          }
        }
      }

      return training;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "UPDATE_TRAINING",
        entityType: "Training",
        entityId: id,
        changes: {
          before: existingTraining,
          after: updatedTraining,
        },
      },
    });

    return NextResponse.json(updatedTraining);
  } catch (error) {
    console.error("Error updating training:", error);
    return NextResponse.json(
      { error: "Eğitim güncellenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// DELETE /api/trainings/[id] - Eğitimi sil (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id } = await params;

    const training = await prisma.training.findUnique({
      where: { id },
    });

    if (!training) {
      return NextResponse.json(
        { error: "Eğitim bulunamadı" },
        { status: 404 }
      );
    }

    if (training.hospitalId !== session.user.hospitalId) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Soft delete
    await prisma.training.update({
      where: { id },
      data: {
        deletedAt: new Date(),
        status: "ARCHIVED",
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "DELETE_TRAINING",
        entityType: "Training",
        entityId: id,
        changes: {
          before: training,
        },
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting training:", error);
    return NextResponse.json(
      { error: "Eğitim silinirken bir hata oluştu" },
      { status: 500 }
    );
  }
}
