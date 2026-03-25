"use client";

import { useState, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import { DndContext, closestCenter, DragEndEvent } from "@dnd-kit/core";
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  Video as VideoIcon,
  Trash2,
  GripVertical,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";
import { useTrainingWizard } from "@/store/training-store";
import type { VideoFormData } from "@/types/training";
import { cn } from "@/lib/utils";

// Helper: Get video duration from file
async function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    video.preload = "metadata";

    video.onloadedmetadata = function () {
      window.URL.revokeObjectURL(video.src);
      const duration = Math.floor(video.duration);
      resolve(duration || 180); // Fallback to 180 if invalid
    };

    video.onerror = function () {
      reject(new Error("Could not load video metadata"));
    };

    video.src = URL.createObjectURL(file);
  });
}

interface Step2VideosProps {
  onValid?: () => void;
}

interface VideoItemProps {
  video: VideoFormData & { tempId: string };
  index: number;
  onUpdate: (index: number, video: Partial<VideoFormData>) => void;
  onRemove: (index: number) => void;
}

function SortableVideoItem({ video, index, onUpdate, onRemove }: VideoItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: video.tempId,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "group rounded-lg border bg-card p-4 transition-shadow",
        isDragging && "opacity-50 shadow-lg"
      )}
    >
      <div className="flex items-start gap-4">
        {/* Drag Handle */}
        <button
          type="button"
          className="cursor-grab active:cursor-grabbing mt-2 text-muted-foreground hover:text-foreground transition-colors"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-5 w-5" />
        </button>

        {/* Video Icon */}
        <div className="mt-2 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
          <VideoIcon className="h-5 w-5 text-primary" />
        </div>

        {/* Content */}
        <div className="flex-1 space-y-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Input
                placeholder="Video başlığı"
                value={video.title}
                onChange={(e) => onUpdate(index, { title: e.target.value })}
                className="font-medium"
              />
              <Textarea
                placeholder="Video açıklaması (opsiyonel)"
                value={video.description || ""}
                onChange={(e) => onUpdate(index, { description: e.target.value })}
                rows={2}
              />
            </div>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => onRemove(index)}
              className="text-destructive hover:text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          {/* Video Info */}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <CheckCircle2 className="h-3 w-3 text-green-600" />
              {Math.floor(video.durationSeconds / 60)} dk {video.durationSeconds % 60} sn
            </span>
            <span className="truncate max-w-[200px]" title={video.videoUrl}>
              {video.videoUrl}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Step2Videos({ onValid }: Step2VideosProps) {
  const { videos, setVideos, addVideo, removeVideo, updateVideo, markStepComplete } =
    useTrainingWizard();

  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string>("");

  // Add tempId for drag & drop
  const videosWithId = videos.map((v, i) => ({
    ...v,
    tempId: v.id || `temp-${i}`,
  }));

  const isValid = videos.length >= 1 && videos.every((v) => v.title && v.videoUrl);

  // Mark step as complete when valid
  useEffect(() => {
    if (isValid) {
      markStepComplete(1);
      onValid?.();
    }
  }, [isValid, markStepComplete, onValid]);

  // Dropzone
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: {
      "video/*": [".mp4", ".webm", ".ogg", ".mov"],
    },
    maxSize: 500 * 1024 * 1024, // 500MB
    maxFiles: 5,
    onDrop: async (acceptedFiles) => {
      setError("");
      setIsUploading(true);

      for (const file of acceptedFiles) {
        try {
          setUploadProgress(0);

          // Step 1: Get presigned URL from API
          const presignedResponse = await fetch("/api/upload/presigned-url", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              fileName: file.name,
              fileType: file.type,
              fileSize: file.size,
              trainingId: undefined, // Can be set if editing existing training
            }),
          });

          if (!presignedResponse.ok) {
            const errorData = await presignedResponse.json();
            throw new Error(errorData.error || "Presigned URL alınamadı");
          }

          const { uploadUrl, videoKey, videoUrl } = await presignedResponse.json();

          // Step 2: Upload file to S3 using presigned URL
          const xhr = new XMLHttpRequest();

          // Track upload progress
          xhr.upload.addEventListener("progress", (event) => {
            if (event.lengthComputable) {
              const percentComplete = Math.round((event.loaded / event.total) * 100);
              setUploadProgress(percentComplete);
            }
          });

          // Upload promise
          await new Promise<void>((resolve, reject) => {
            xhr.addEventListener("load", () => {
              if (xhr.status === 200) {
                resolve();
              } else {
                reject(new Error(`Upload failed: ${xhr.status}`));
              }
            });

            xhr.addEventListener("error", () => {
              reject(new Error("Network error during upload"));
            });

            xhr.open("PUT", uploadUrl);
            xhr.setRequestHeader("Content-Type", file.type);
            xhr.send(file);
          });

          // Step 3: Get video duration
          const durationSeconds = await getVideoDuration(file).catch(() => 180);

          // Step 4: Add video to store
          const videoData: VideoFormData = {
            title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
            description: "",
            videoUrl, // S3 public URL
            videoKey, // S3 key for future reference
            durationSeconds,
            sortOrder: videos.length,
          };

          addVideo(videoData);
          setUploadProgress(100);
        } catch (uploadError: any) {
          console.error("Upload error:", uploadError);
          setError(uploadError.message || "Video yüklenemedi");
        }
      }

      setUploadProgress(0);
      setIsUploading(false);
    },
    onDropRejected: (fileRejections) => {
      const errors = fileRejections.map((fr) => fr.errors.map((e) => e.message).join(", "));
      setError(errors.join("; "));
      setIsUploading(false);
    },
  });

  // Drag and Drop reordering
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = videosWithId.findIndex((v) => v.tempId === active.id);
      const newIndex = videosWithId.findIndex((v) => v.tempId === over.id);

      const reordered = arrayMove(videosWithId, oldIndex, newIndex).map((v, i) => ({
        ...v,
        sortOrder: i,
      }));

      // Remove tempId before saving
      const cleaned = reordered.map(({ tempId, ...rest }) => rest);
      setVideos(cleaned);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Eğitim Videoları</CardTitle>
          <CardDescription>
            Eğitim videolarını yükleyin. Videoları sürükleyerek sıralayabilirsiniz.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Upload Zone */}
          <div
            {...getRootProps()}
            className={cn(
              "cursor-pointer rounded-lg border-2 border-dashed p-12 text-center transition-colors",
              isDragActive
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50 hover:bg-muted/50",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              {isDragActive ? (
                <p className="text-lg font-medium">Videoları buraya bırakın...</p>
              ) : (
                <>
                  <p className="text-lg font-medium">
                    Videoları buraya sürükleyin veya tıklayarak seçin
                  </p>
                  <p className="text-sm text-muted-foreground">
                    MP4, WebM, MOV formatları desteklenir (Maks. 500MB)
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Upload Progress */}
          {isUploading && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Yükleniyor...</span>
                <span className="font-mono">{uploadProgress}%</span>
              </div>
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Video List */}
          {videos.length > 0 && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-medium">
                  Yüklenen Videolar ({videos.length})
                </h3>
                <p className="text-sm text-muted-foreground">
                  Sıraya göre gösterilecektir
                </p>
              </div>

              <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                <SortableContext
                  items={videosWithId.map((v) => v.tempId)}
                  strategy={verticalListSortingStrategy}
                >
                  <div className="space-y-3">
                    {videosWithId.map((video, index) => (
                      <SortableVideoItem
                        key={video.tempId}
                        video={video}
                        index={index}
                        onUpdate={updateVideo}
                        onRemove={removeVideo}
                      />
                    ))}
                  </div>
                </SortableContext>
              </DndContext>
            </div>
          )}

          {/* Validation Message */}
          {videos.length === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                En az 1 video eklemelisiniz. Videoları yükledikten sonra başlık
                ve açıklama ekleyebilirsiniz.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
