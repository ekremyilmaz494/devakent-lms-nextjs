import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/trainings/[id]/analytics - Get training analytics
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !["ADMIN", "SUPER_ADMIN"].includes(session.user.role)) {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: trainingId } = await params;

    // Get training with questions
    const training = await prisma.training.findUnique({
      where: { id: trainingId },
      include: {
        questions: {
          include: {
            options: true,
          },
          orderBy: {
            sortOrder: "asc",
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

    // Get all attempts for this training
    const attempts = await prisma.examAttempt.findMany({
      where: {
        assignment: {
          trainingId,
        },
        completedAt: { not: null },
      },
      select: {
        id: true,
        score: true,
        isPassed: true,
        answers: true, // Json field
        startedAt: true,
        completedAt: true,
      },
    });

    // Question-level analytics
    const questionAnalytics = training.questions.map((question) => {
      const correctOption = question.options.find((opt) => opt.isCorrect);
      let totalAnswers = 0;
      let correctAnswers = 0;

      attempts.forEach((attempt) => {
        if (attempt.answers && Array.isArray(attempt.answers)) {
          const answersArray = attempt.answers as Array<{
            questionId: string;
            selectedOptionId: string;
            isCorrect: boolean;
          }>;
          const answer = answersArray.find((a: any) => a.questionId === question.id);
          if (answer) {
            totalAnswers++;
            if (answer.isCorrect) {
              correctAnswers++;
            }
          }
        }
      });

      const incorrectAnswers = totalAnswers - correctAnswers;

      // Option-level statistics
      const optionStats = question.options.map((option) => {
        let selectionCount = 0;
        attempts.forEach((attempt) => {
          if (attempt.answers && Array.isArray(attempt.answers)) {
            const answersArray = attempt.answers as Array<{
              questionId: string;
              selectedOptionId: string;
              isCorrect: boolean;
            }>;
            const answer = answersArray.find((a: any) => a.questionId === question.id);
            if (answer && answer.selectedOptionId === option.id) {
              selectionCount++;
            }
          }
        });

        return {
          optionId: option.id,
          optionText: option.optionText,
          isCorrect: option.isCorrect,
          selectionCount,
          selectionPercentage:
            totalAnswers > 0
              ? Math.round((selectionCount / totalAnswers) * 100)
              : 0,
        };
      });

      return {
        questionId: question.id,
        questionText: question.questionText,
        points: question.points,
        totalAnswers,
        correctAnswers,
        incorrectAnswers,
        correctPercentage:
          totalAnswers > 0
            ? Math.round((correctAnswers / totalAnswers) * 100)
            : 0,
        incorrectPercentage:
          totalAnswers > 0
            ? Math.round((incorrectAnswers / totalAnswers) * 100)
            : 0,
        optionStats,
      };
    });

    // Score distribution (0-20, 21-40, 41-60, 61-80, 81-100)
    const scoreRanges = [
      { min: 0, max: 20, count: 0, label: "0-20" },
      { min: 21, max: 40, count: 0, label: "21-40" },
      { min: 41, max: 60, count: 0, label: "41-60" },
      { min: 61, max: 80, count: 0, label: "61-80" },
      { min: 81, max: 100, count: 0, label: "81-100" },
    ];

    attempts.forEach((attempt) => {
      if (attempt.score !== null) {
        const range = scoreRanges.find(
          (r) => attempt.score! >= r.min && attempt.score! <= r.max
        );
        if (range) {
          range.count++;
        }
      }
    });

    // Time analytics - calculate from startedAt and completedAt
    const timeStats = attempts
      .filter((a) => a.startedAt && a.completedAt)
      .map((a) => {
        const start = new Date(a.startedAt!).getTime();
        const end = new Date(a.completedAt!).getTime();
        return Math.round((end - start) / 1000); // seconds
      });

    const averageTimeSeconds =
      timeStats.length > 0
        ? Math.round(
            timeStats.reduce((sum, time) => sum + time, 0) / timeStats.length
          )
        : 0;

    const minTimeSeconds = timeStats.length > 0 ? Math.min(...timeStats) : 0;
    const maxTimeSeconds = timeStats.length > 0 ? Math.max(...timeStats) : 0;

    // Attempt analytics
    const assignmentsWithAttempts = await prisma.trainingAssignment.findMany({
      where: { trainingId },
      include: {
        examAttempts: {
          select: {
            id: true,
          },
        },
      },
    });

    const attemptCounts = assignmentsWithAttempts.map(
      (a) => a.examAttempts.length
    );
    const averageAttempts =
      attemptCounts.length > 0
        ? (
            attemptCounts.reduce((sum, count) => sum + count, 0) /
            attemptCounts.length
          ).toFixed(1)
        : "0.0";

    return NextResponse.json({
      questionAnalytics,
      scoreDistribution: scoreRanges,
      timeAnalytics: {
        averageSeconds: averageTimeSeconds,
        minSeconds: minTimeSeconds,
        maxSeconds: maxTimeSeconds,
        averageMinutes: Math.round(averageTimeSeconds / 60),
        minMinutes: Math.round(minTimeSeconds / 60),
        maxMinutes: Math.round(maxTimeSeconds / 60),
      },
      attemptAnalytics: {
        averageAttempts: parseFloat(averageAttempts),
        totalAttempts: attempts.length,
        totalAssignments: assignmentsWithAttempts.length,
      },
    });
  } catch (error) {
    console.error("Error fetching training analytics:", error);
    return NextResponse.json(
      { error: "Analizler yüklenemedi" },
      { status: 500 }
    );
  }
}
