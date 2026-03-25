import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { TrainingStatus, type TrainingFilters } from "@/types/training";

// GET /api/trainings - Eğitim listesi
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status") as keyof typeof TrainingStatus | null;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const hospitalId = session.user.role === "ADMIN" ? session.user.hospitalId : searchParams.get("hospitalId");

    // Build where clause
    const where: any = {
      deletedAt: null,
    };

    if (hospitalId) {
      where.hospitalId = hospitalId;
    }

    if (status) {
      where.status = status;
    }

    if (category) {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: "insensitive" } },
        { description: { contains: search, mode: "insensitive" } },
      ];
    }

    const trainings = await prisma.training.findMany({
      where,
      include: {
        _count: {
          select: {
            videos: true,
            questions: true,
            assignments: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Calculate stats for each training
    const trainingsWithStats = await Promise.all(
      trainings.map(async (training) => {
        const assignments = await prisma.trainingAssignment.findMany({
          where: { trainingId: training.id },
        });

        const completedCount = assignments.filter(
          (a) => a.status === "passed" || a.status === "failed"
        ).length;

        return {
          id: training.id,
          title: training.title,
          category: training.category,
          status: training.status,
          startDate: training.startDate,
          endDate: training.endDate,
          videosCount: training._count.videos,
          questionsCount: training._count.questions,
          assignedCount: training._count.assignments,
          completedCount,
          createdAt: training.createdAt,
        };
      })
    );

    return NextResponse.json(trainingsWithStats);
  } catch (error) {
    console.error("Error fetching trainings:", error);
    return NextResponse.json(
      { error: "Eğitimler yüklenirken bir hata oluştu" },
      { status: 500 }
    );
  }
}

// POST /api/trainings - Yeni eğitim oluştur
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { info, videos, questions, assignment } = body;

    // Validation
    if (!info || !videos || !questions) {
      return NextResponse.json(
        { error: "Eksik eğitim bilgileri" },
        { status: 400 }
      );
    }

    // Transaction ile tüm ilgili verileri oluştur
    const training = await prisma.$transaction(async (tx) => {
      // 1. Training oluştur
      const newTraining = await tx.training.create({
        data: {
          title: info.title,
          description: info.description,
          thumbnail: info.thumbnail || null,
          category: info.category || null,
          passingScore: info.passingScore,
          maxAttempts: info.maxAttempts,
          examDuration: info.examDuration,
          startDate: new Date(info.startDate),
          endDate: new Date(info.endDate),
          status: "DRAFT",
          hospitalId: session.user.hospitalId!,
          createdBy: session.user.id,
        },
      });

      // 2. Videos oluştur
      if (videos.videos && videos.videos.length > 0) {
        await tx.trainingVideo.createMany({
          data: videos.videos.map((video: any, index: number) => ({
            trainingId: newTraining.id,
            title: video.title,
            description: video.description || null,
            videoUrl: video.videoUrl,
            videoKey: video.videoKey,
            durationSeconds: video.durationSeconds,
            sortOrder: video.sortOrder ?? index,
          })),
        });
      }

      // 3. Questions ve Options oluştur
      if (questions.questions && questions.questions.length > 0) {
        for (const [index, question] of questions.questions.entries()) {
          const createdQuestion = await tx.question.create({
            data: {
              trainingId: newTraining.id,
              questionText: question.questionText,
              questionType: question.questionType,
              points: question.points,
              sortOrder: question.sortOrder ?? index,
            },
          });

          // Question options
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

      // 4. Assignments oluştur (opsiyonel)
      if (assignment?.userIds && assignment.userIds.length > 0) {
        await tx.trainingAssignment.createMany({
          data: assignment.userIds.map((userId: string) => ({
            trainingId: newTraining.id,
            userId,
            maxAttempts: info.maxAttempts,
            assignedBy: session.user.id,
          })),
        });
      }

      return newTraining;
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: "CREATE_TRAINING",
        entityType: "Training",
        entityId: training.id,
        changes: {
          after: { title: training.title, status: training.status },
        },
      },
    });

    return NextResponse.json(training, { status: 201 });
  } catch (error) {
    console.error("Error creating training:", error);
    return NextResponse.json(
      { error: "Eğitim oluşturulurken bir hata oluştu" },
      { status: 500 }
    );
  }
}
