import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// GET /api/staff/my-trainings/[id] - Get training detail with attempt history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || session.user.role !== "STAFF") {
      return NextResponse.json({ error: "Yetkisiz erişim" }, { status: 401 });
    }

    const { id: trainingId } = await params;

    // Get assignment for this training
    const assignment = await prisma.trainingAssignment.findFirst({
      where: {
        trainingId,
        userId: session.user.id,
      },
      include: {
        training: {
          include: {
            videos: {
              orderBy: {
                sortOrder: "asc",
              },
            },
            questions: {
              include: {
                options: {
                  orderBy: {
                    sortOrder: "asc",
                  },
                },
              },
              orderBy: {
                sortOrder: "asc",
              },
            },
          },
        },
        examAttempts: {
          orderBy: {
            attemptNumber: "desc",
          },
        },
        videoProgress: {
          select: {
            videoId: true,
            completed: true,
            watchedSeconds: true,
          },
        },
      },
    });

    if (!assignment) {
      return NextResponse.json(
        { error: "Eğitim bulunamadı veya size atanmamış" },
        { status: 404 }
      );
    }

    // Check if all videos are watched (required for final exam)
    const totalVideos = assignment.training.videos.length;
    const completedVideos = assignment.videoProgress.filter(
      (vp) => vp.completed
    ).length;
    const allVideosWatched = totalVideos > 0 && completedVideos >= totalVideos;

    // Determine exam eligibility
    const canTakePreExam = assignment.currentAttempt === 0; // First attempt
    const canTakeFinalExam =
      assignment.currentAttempt > 0 &&
      assignment.currentAttempt < assignment.maxAttempts &&
      allVideosWatched &&
      assignment.status !== "passed" &&
      assignment.status !== "locked";

    // Format attempt history
    const attemptHistory = assignment.examAttempts.map((attempt) => ({
      id: attempt.id,
      attemptNumber: attempt.attemptNumber,
      score: attempt.score,
      isPassed: attempt.isPassed,
      status: attempt.status,
      startedAt: attempt.startedAt,
      completedAt: attempt.completedAt,
    }));

    // Format video progress
    const videosWithProgress = assignment.training.videos.map((video) => {
      const progress = assignment.videoProgress.find(
        (vp) => vp.videoId === video.id
      );

      return {
        id: video.id,
        title: video.title,
        description: video.description,
        videoUrl: video.videoUrl,
        durationSeconds: video.durationSeconds,
        sortOrder: video.sortOrder,
        completed: progress?.completed || false,
        watchedSeconds: progress?.watchedSeconds || 0,
      };
    });

    return NextResponse.json({
      assignment: {
        id: assignment.id,
        status: assignment.status,
        currentAttempt: assignment.currentAttempt,
        maxAttempts: assignment.maxAttempts,
        assignedAt: assignment.assignedAt,
        completedAt: assignment.completedAt,
      },
      training: {
        id: assignment.training.id,
        title: assignment.training.title,
        description: assignment.training.description,
        category: assignment.training.category,
        thumbnail: assignment.training.thumbnail,
        passingScore: assignment.training.passingScore,
        maxAttempts: assignment.training.maxAttempts,
        examDuration: assignment.training.examDuration,
        startDate: assignment.training.startDate,
        endDate: assignment.training.endDate,
      },
      videos: videosWithProgress,
      attemptHistory,
      eligibility: {
        canTakePreExam,
        canTakeFinalExam,
        allVideosWatched,
        remainingAttempts: assignment.maxAttempts - assignment.currentAttempt,
      },
      stats: {
        totalVideos,
        completedVideos,
        totalQuestions: assignment.training.questions.length,
        videoProgress: totalVideos > 0 ? (completedVideos / totalVideos) * 100 : 0,
      },
    });
  } catch (error) {
    console.error("Error fetching training detail:", error);
    return NextResponse.json(
      { error: "Eğitim detayı yüklenemedi" },
      { status: 500 }
    );
  }
}
