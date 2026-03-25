import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";

// POST /api/trainings/[id]/watch - Track video watch progress (heartbeat)
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
    const { videoId, currentTime, duration, completed } = body;

    if (!videoId) {
      return NextResponse.json({ error: "Video ID gereklidir" }, { status: 400 });
    }

    const assignment = await prisma.trainingAssignment.findFirst({
      where: { trainingId, userId: session.user.id },
    });

    if (!assignment) {
      return NextResponse.json({ error: "Eğitim ataması bulunamadı" }, { status: 404 });
    }

    const video = await prisma.trainingVideo.findFirst({
      where: { id: videoId, trainingId },
    });

    if (!video) {
      return NextResponse.json({ error: "Video bulunamadı" }, { status: 404 });
    }

    const watchedSeconds = Math.floor(currentTime || 0);
    const isCompleted = completed || (duration > 0 && currentTime / duration >= 0.9);

    const videoProgress = await prisma.videoProgress.upsert({
      where: {
        assignmentId_videoId: { assignmentId: assignment.id, videoId },
      },
      update: {
        watchedSeconds: Math.max(watchedSeconds, 0),
        completed: isCompleted,
        lastWatchedAt: new Date(),
      },
      create: {
        assignmentId: assignment.id,
        videoId,
        watchedSeconds: Math.max(watchedSeconds, 0),
        completed: isCompleted,
        lastWatchedAt: new Date(),
      },
    });

    if (assignment.status === "assigned") {
      await prisma.trainingAssignment.update({
        where: { id: assignment.id },
        data: { status: "in_progress" },
      });
    }

    return NextResponse.json({
      success: true,
      progress: {
        videoId,
        watchedSeconds: videoProgress.watchedSeconds,
        completed: videoProgress.completed,
      },
    });
  } catch (error) {
    console.error("Error tracking watch progress:", error);
    return NextResponse.json({ error: "İzleme kaydı güncellenemedi" }, { status: 500 });
  }
}
