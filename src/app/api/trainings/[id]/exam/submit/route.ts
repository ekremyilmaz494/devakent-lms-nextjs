import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/trainings/[id]/exam/submit - Submit exam answers
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: trainingId } = await params;
    const body = await request.json();
    const { attemptId, answers } = body;

    if (!attemptId || !answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: "Geçersiz veri" }, { status: 400 });
    }

    // Get attempt with training details
    const attempt = await prisma.examAttempt.findUnique({
      where: { id: attemptId },
      include: {
        assignment: {
          include: {
            training: {
              include: {
                questions: {
                  include: { options: true },
                },
              },
            },
          },
        },
      },
    });

    if (!attempt) {
      return NextResponse.json({ error: "Sınav denemesi bulunamadı" }, { status: 404 });
    }

    // Verify ownership
    if (attempt.assignment.userId !== session.user.id) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 403 });
    }

    // Check if already submitted
    if (attempt.status === "COMPLETED") {
      return NextResponse.json({ error: "Bu sınav zaten teslim edilmiş" }, { status: 400 });
    }

    // Calculate time spent
    const startedAt = attempt.startedAt ? new Date(attempt.startedAt) : new Date();
    const completedAt = new Date();
    const timeSpentSeconds = Math.floor((completedAt.getTime() - startedAt.getTime()) / 1000);

    // Process answers and calculate score
    let totalPoints = 0;
    let earnedPoints = 0;
    const answerRecords = [];

    for (const answer of answers) {
      const question = attempt.assignment.training.questions.find(q => q.id === answer.questionId);
      
      if (!question) continue;

      totalPoints += question.points;

      const selectedOption = question.options.find(opt => opt.id === answer.selectedOptionId);
      const isCorrect = selectedOption?.isCorrect || false;

      if (isCorrect) {
        earnedPoints += question.points;
      }

      answerRecords.push({
        attemptId: attempt.id,
        questionId: question.id,
        selectedOptionId: answer.selectedOptionId,
        isCorrect,
      });
    }

    // Calculate score percentage
    const score = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const isPassed = score >= attempt.assignment.training.passingScore;

    // Update attempt with answers (stored as JSON) and results
    await prisma.examAttempt.update({
      where: { id: attemptId },
      data: {
        completedAt,
        score,
        isPassed,
        answers: answerRecords, // JSON field
        status: "COMPLETED",
      },
    });

    // Update assignment
    const newAttemptNumber = attempt.assignment.currentAttempt + 1;
    
    let newStatus = attempt.assignment.status;
    if (isPassed) {
      newStatus = "passed";
    } else if (newAttemptNumber >= attempt.assignment.maxAttempts) {
      newStatus = "locked"; // Failed all attempts
    } else {
      newStatus = "in_progress";
    }

    await prisma.trainingAssignment.update({
      where: { id: attempt.assignment.id },
      data: {
        currentAttempt: newAttemptNumber,
        status: newStatus,
        completedAt: isPassed ? completedAt : null,
      },
    });

    // Audit log
    await prisma.auditLog.create({
      data: {
        userId: session.user.id,
        hospitalId: session.user.hospitalId!,
        action: isPassed ? "EXAM_PASSED" : "EXAM_FAILED",
        entityType: "ExamAttempt",
        entityId: attempt.id,
        changes: {
          attemptNumber: newAttemptNumber,
          score,
          isPassed,
        },
      },
    });

    return NextResponse.json({
      success: true,
      result: {
        attemptId: attempt.id,
        score,
        isPassed,
        passingScore: attempt.assignment.training.passingScore,
        earnedPoints,
        totalPoints,
        timeSpentSeconds,
        status: newStatus,
        remainingAttempts: Math.max(0, attempt.assignment.maxAttempts - newAttemptNumber),
      },
    });
  } catch (error) {
    console.error("Error submitting exam:", error);
    return NextResponse.json({ error: "Sınav teslim edilemedi" }, { status: 500 });
  }
}
