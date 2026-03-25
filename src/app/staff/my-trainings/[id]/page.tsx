"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { VideoPlayer } from "@/components/staff/video-player";
import { ArrowLeft, CheckCircle2, PlayCircle, Target } from "lucide-react";
import { cn } from "@/lib/utils";

export default function TrainingPlayerPage() {
  const params = useParams();
  const router = useRouter();
  const trainingId = params.id as string;

  // Mock data
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [completedVideos, setCompletedVideos] = useState<number[]>([]);

  const training = {
    id: trainingId,
    title: "İş Güvenliği Temel Eğitimi",
    videos: [
      {
        id: "v1",
        title: "Giriş ve Temel Kavramlar",
        duration: 180,
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
      },
      {
        id: "v2",
        title: "Kişisel Koruyucu Donanımlar",
        duration: 240,
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
      },
      {
        id: "v3",
        title: "Acil Durum Prosedürleri",
        duration: 300,
        url: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
      },
    ],
    totalQuestions: 20,
    passingScore: 70,
  };

  const currentVideo = training.videos[currentVideoIndex];
  const totalVideos = training.videos.length;
  const progress = Math.round((completedVideos.length / totalVideos) * 100);
  const allVideosCompleted = completedVideos.length === totalVideos;

  const handleVideoComplete = () => {
    if (!completedVideos.includes(currentVideoIndex)) {
      setCompletedVideos([...completedVideos, currentVideoIndex]);
    }
  };

  const handleNextVideo = () => {
    if (currentVideoIndex < totalVideos - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  const handleStartExam = () => {
    router.push(`/staff/my-trainings/${trainingId}/exam`);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/staff/my-trainings">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="font-heading text-2xl font-bold">{training.title}</h1>
            <p className="text-sm text-muted-foreground">
              Video {currentVideoIndex + 1} / {totalVideos}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-right">
            <p className="text-sm font-medium">İlerleme</p>
            <p className="text-2xl font-bold text-primary">{progress}%</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Video Player */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentVideo.title}</span>
                {completedVideos.includes(currentVideoIndex) && (
                  <Badge className="bg-green-100 text-green-700">
                    <CheckCircle2 className="h-3 w-3 mr-1" />
                    Tamamlandı
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VideoPlayer
                src={currentVideo.url}
                trainingId={trainingId}
                videoId={currentVideo.id}
                onComplete={handleVideoComplete}
                onNext={handleNextVideo}
                hasNext={currentVideoIndex < totalVideos - 1}
              />
            </CardContent>
          </Card>

          {/* Progress Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Video İlerlemesi</span>
                  <span className="font-medium">
                    {completedVideos.length} / {totalVideos} tamamlandı
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Video List */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Videolar</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {training.videos.map((video, index) => (
                <button
                  key={video.id}
                  onClick={() => setCurrentVideoIndex(index)}
                  className={cn(
                    "w-full text-left p-3 rounded-lg border transition-colors",
                    currentVideoIndex === index
                      ? "bg-primary/10 border-primary"
                      : "hover:bg-muted",
                    completedVideos.includes(index) && "border-green-200 bg-green-50 dark:bg-green-950/20"
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{video.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.floor(video.duration / 60)} dakika
                      </p>
                    </div>
                    {completedVideos.includes(index) ? (
                      <CheckCircle2 className="h-5 w-5 text-green-600 shrink-0" />
                    ) : currentVideoIndex === index ? (
                      <PlayCircle className="h-5 w-5 text-primary shrink-0" />
                    ) : (
                      <div className="h-5 w-5 shrink-0 rounded-full border-2 border-muted-foreground/30" />
                    )}
                  </div>
                </button>
              ))}
            </CardContent>
          </Card>

          {/* Exam Info */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Target className="h-5 w-5" />
                Sınav Bilgileri
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Soru Sayısı</span>
                  <span className="font-medium">{training.totalQuestions}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Geçme Puanı</span>
                  <span className="font-medium">%{training.passingScore}</span>
                </div>
              </div>

              <Button
                onClick={handleStartExam}
                disabled={!allVideosCompleted}
                className="w-full"
              >
                {allVideosCompleted ? "Sınava Başla" : "Tüm Videoları İzleyin"}
              </Button>

              {!allVideosCompleted && (
                <p className="text-xs text-muted-foreground text-center">
                  Sınava başlamak için tüm videoları izlemelisiniz
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
