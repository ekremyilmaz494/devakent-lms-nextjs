import { useState, useCallback } from "react";
import { getVideoMetadata, uploadFileToS3, type UploadProgress } from "@/lib/s3";

export interface VideoUploadState {
  isUploading: boolean;
  progress: number;
  error: string | null;
  uploadedVideo: UploadedVideoData | null;
}

export interface UploadedVideoData {
  videoUrl: string;
  videoKey: string;
  durationSeconds: number;
  title: string;
  fileName: string;
}

export function useVideoUpload() {
  const [state, setState] = useState<VideoUploadState>({
    isUploading: false,
    progress: 0,
    error: null,
    uploadedVideo: null,
  });

  const uploadVideo = useCallback(
    async (file: File, trainingId?: string): Promise<UploadedVideoData | null> => {
      setState({
        isUploading: true,
        progress: 0,
        error: null,
        uploadedVideo: null,
      });

      try {
        // Step 1: Get video metadata
        let metadata;
        try {
          metadata = await getVideoMetadata(file);
        } catch (err) {
          console.warn("Could not extract video metadata, using defaults", err);
          metadata = {
            duration: 180, // Default 3 minutes
            width: 1920,
            height: 1080,
            size: file.size,
          };
        }

        // Step 2: Get presigned URL from API
        const presignedResponse = await fetch("/api/upload/presigned-url", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            fileName: file.name,
            fileType: file.type,
            fileSize: file.size,
            trainingId,
          }),
        });

        if (!presignedResponse.ok) {
          const errorData = await presignedResponse.json();
          throw new Error(errorData.error || "Presigned URL alınamadı");
        }

        const presignedData = await presignedResponse.json();
        const { uploadUrl, videoKey, videoUrl } = presignedData;

        // Step 3: Upload to S3 with progress tracking
        await uploadFileToS3(file, uploadUrl, (progress: UploadProgress) => {
          setState((prev) => ({
            ...prev,
            progress: progress.percentage,
          }));
        });

        // Step 4: Success
        const uploadedVideo: UploadedVideoData = {
          videoUrl,
          videoKey,
          durationSeconds: metadata.duration,
          title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
          fileName: file.name,
        };

        setState({
          isUploading: false,
          progress: 100,
          error: null,
          uploadedVideo,
        });

        return uploadedVideo;
      } catch (err: any) {
        console.error("Video upload error:", err);
        setState({
          isUploading: false,
          progress: 0,
          error: err.message || "Video yüklenemedi",
          uploadedVideo: null,
        });
        return null;
      }
    },
    []
  );

  const reset = useCallback(() => {
    setState({
      isUploading: false,
      progress: 0,
      error: null,
      uploadedVideo: null,
    });
  }, []);

  return {
    ...state,
    uploadVideo,
    reset,
  };
}
