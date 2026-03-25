import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// Seeded shuffle for consistent randomization
function seededShuffle<T>(array: T[], seed: string): T[] {
  const arr = [...array];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = ((hash << 5) - hash) + seed.charCodeAt(i);
    hash = hash & hash;
  }
  
  for (let i = arr.length - 1; i > 0; i--) {
    hash = (hash * 9301 + 49297) % 233280;
    const j = Math.floor((hash / 233280) * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// POST /api/trainings/[id]/exam/start - Start exam (create attempt)
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: trainingId } = await params;
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const body = await request.json();
    const { examType } = body; // "pre_exam" or "final_exam"

    if (!examType || !["pre_exam", "final_exam"].includes(examType)) {
      return NextResponse.json({ error: "Geçersiz sınav tipi" }, { status: 400 });
    }

    // Get assignment
    const assignment = await prisma.trainingAssignment.findFirst({
      where: { trainingId, userId: session.user.id },
      include: {
        training: {
          include: {
            questions: {
              include: { options: { orderBy: { sortOrder: "asc" } } },
              orderBy: { sortOrder: "asc" },
            },
            videos: {
              select: {
                id: true,
              },
            },
          },
        },
        videoProgress: true,
      },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Eğitim ataması bulunamadı" }, { status: 404 });
    }

    // Check if locked
    if (assignment.status === "locked") {
      return NextResponse.json({ error: "Eğitim kilitli. Lütfen admin ile iletişime geçin." }, { status: 403 });
    }

    // Check if already passed
    if (assignment.status === "passed") {
      return NextResponse.json({ error: "Bu eğitimi zaten başarıyla tamamladınız." }, { status: 400 });
    }

    // Check attempt limit
    if (assignment.currentAttempt >= assignment.maxAttempts) {
      return NextResponse.json({ error: "Deneme hakkınız kalmadı." }, { status: 403 });
    }

    // Pre-exam can only be taken on first attempt
    if (examType === "pre_exam" && assignment.currentAttempt !== 0) {
      return NextResponse.json({ error: "Ön sınav sadece ilk denemede alınabilir." }, { status: 400 });
    }

    // Final exam requires all videos watched
    if (examType === "final_exam") {
      const totalVideos = assignment.training.videos?.length || 0;
      const completedVideos = assignment.videoProgress.filter(vp => vp.completed).length;
      
      if (totalVideos > 0 && completedVideos < totalVideos) {
        return NextResponse.json({ error: "Son sınav için tüm videoları izlemelisiniz." }, { status: 400 });
      }
    }

    const attemptNumber = assignment.currentAttempt + 1;
    
    // Create exam attempt
    const attempt = await prisma.examAttempt.create({
      data: {
        assignmentId: assignment.id,
        trainingId: assignment.trainingId,
        userId: session.user.id,
        attemptNumber,
        startedAt: new Date(),
        status: "IN_PROGRESS",
      },
    });

    // Get questions (shuffle for final exam)
    let questions = assignment.training.questions;
    
    if (examType === "final_exam") {
      // Shuffle questions using seed (attempt_id + user_id)
      const seed = `${attempt.id}-${session.user.id}`;
      questions = seededShuffle(questions, seed);
      
      // Shuffle options for each question
      questions = questions.map(q => ({
        ...q,
        options: seededShuffle(q.options, `${seed}-${q.id}`),
      }));
    }

    // Format questions for frontend (hide correct answers)
    const examQuestions = questions.map((q, index) => ({
      id: q.id,
      questionNumber: index + 1,
      questionText: q.questionText,
      questionType: q.questionType,
      points: q.points,
      options: q.options.map(opt => ({
        id: opt.id,
        optionText: opt.optionText,
        // Don't send isCorrect to frontend
      })),
    }));

    return NextResponse.json({
      attemptId: attempt.id,
      attemptNumber,
      examType,
      startedAt: attempt.startedAt,
      duration: assignment.training.examDuration,
      questions: examQuestions,
      totalQuestions: examQuestions.length,
    });
  } catch (error) {
    console.error("Error starting exam:", error);
    return NextResponse.json({ error: "Sınav başlatılamadı" }, { status: 500 });
  }
}
