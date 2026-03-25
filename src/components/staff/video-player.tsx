"use client";

import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Play, Pause, Volume2, VolumeX, Maximize, SkipForward } from "lucide-react";
import { cn } from "@/lib/utils";

interface VideoPlayerProps {
  src: string;
  trainingId: string;
  videoId: string;
  maxWatchedSeconds?: number; // Max position user has watched (from DB)
  onProgress?: (currentTime: number, duration: number) => void;
  onComplete?: () => void;
  onNext?: () => void;
  hasNext?: boolean;
}

export function VideoPlayer({
  src,
  trainingId,
  videoId,
  maxWatchedSeconds = 0,
  onProgress,
  onComplete,
  onNext,
  hasNext = false,
}: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Watch tracking
  const [watchStartTime, setWatchStartTime] = useState<number>(0);
  const [totalWatchTime, setTotalWatchTime] = useState(0);
  const lastProgressUpdateRef = useRef<number>(0);

  // Track watch progress to API
  const trackWatchProgress = async (
    trainingId: string,
    videoId: string,
    currentTime: number,
    duration: number
  ) => {
    try {
      const watchPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;
      const completed = watchPercentage >= 90; // Auto-complete at 90%

      await fetch(`/api/trainings/${trainingId}/watch`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          videoId,
          currentTime,
          duration,
          completed,
        }),
      });
    } catch (error) {
      console.error("Failed to track watch progress:", error);
      // Don't throw - tracking should be non-blocking
    }
  };

  // Initialize video
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handleTimeUpdate = () => {
      const current = video.currentTime;
      setCurrentTime(current);

      // Track watch progress (send to API every 10 seconds)
      if (current - lastProgressUpdateRef.current >= 10) {
        lastProgressUpdateRef.current = current;
        onProgress?.(current, video.duration);

        // Send to API
        trackWatchProgress(trainingId, videoId, current, video.duration);
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);

      // Mark as complete
      trackWatchProgress(trainingId, videoId, video.duration, video.duration);

      onComplete?.();
    };

    const handlePlay = () => {
      setWatchStartTime(Date.now());
      setIsPlaying(true);
    };

    const handlePause = () => {
      const elapsed = (Date.now() - watchStartTime) / 1000;
      setTotalWatchTime((prev) => prev + elapsed);
      setIsPlaying(false);
    };

    video.addEventListener("loadedmetadata", handleLoadedMetadata);
    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("ended", handleEnded);
    video.addEventListener("play", handlePlay);
    video.addEventListener("pause", handlePause);

    return () => {
      video.removeEventListener("loadedmetadata", handleLoadedMetadata);
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("ended", handleEnded);
      video.removeEventListener("play", handlePlay);
      video.removeEventListener("pause", handlePause);
    };
  }, [trainingId, videoId, onProgress, onComplete, watchStartTime]);

  // Disable playback rate changes (anti-speed hack)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleRateChange = () => {
      if (video.playbackRate !== 1) {
        video.playbackRate = 1;
        console.warn("Playback speed is locked at 1x");
      }
    };

    video.addEventListener("ratechange", handleRateChange);
    return () => video.removeEventListener("ratechange", handleRateChange);
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };

  const handleSeek = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newTime = (value[0] / 100) * duration;

    // ANTI-SKIP: Prevent seeking beyond watched position
    const maxAllowed = Math.max(maxWatchedSeconds, currentTime) + 5; // Allow 5sec buffer

    if (newTime > maxAllowed) {
      // Block forward seek
      console.warn("İleri sarma engellendi. Videoyu normal hızda izlemelisiniz.");
      return;
    }

    video.currentTime = newTime;
    setCurrentTime(newTime);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setIsMuted(!video.muted);
  };

  const handleVolumeChange = (value: number[]) => {
    const video = videoRef.current;
    if (!video) return;

    const newVolume = value[0] / 100;
    video.volume = newVolume;
    setVolume(newVolume);
    setIsMuted(newVolume === 0);
  };

  const toggleFullscreen = () => {
    const container = videoRef.current?.parentElement;
    if (!container) return;

    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className="relative w-full bg-black rounded-lg overflow-hidden group">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={src}
        className="w-full aspect-video"
        onClick={togglePlay}
        onContextMenu={(e) => e.preventDefault()} // Disable right-click
        controlsList="nodownload noplaybackrate" // Disable download and speed controls
        disablePictureInPicture
      />

      {/* Custom Controls */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 opacity-0 group-hover:opacity-100 transition-opacity">
        {/* Progress Bar */}
        <div className="mb-4">
          <input
            type="range"
            min="0"
            max="100"
            value={progressPercentage}
            onChange={(e) => handleSeek([parseFloat(e.target.value)])}
            className="w-full h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #34d399 ${progressPercentage}%, rgba(255,255,255,0.3) ${progressPercentage}%)`,
            }}
          />
        </div>

        {/* Control Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            {/* Play/Pause */}
            <Button
              variant="ghost"
              size="icon"
              onClick={togglePlay}
              className="text-white hover:text-primary"
            >
              {isPlaying ? (
                <Pause className="h-6 w-6" />
              ) : (
                <Play className="h-6 w-6" />
              )}
            </Button>

            {/* Time */}
            <span className="text-white text-sm font-mono">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>

            {/* Next Button */}
            {hasNext && onNext && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onNext}
                className="text-white hover:text-primary"
              >
                <SkipForward className="h-5 w-5 mr-2" />
                Sonraki Video
              </Button>
            )}
          </div>

          <div className="flex items-center gap-4">
            {/* Volume */}
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleMute}
                className="text-white hover:text-primary"
              >
                {isMuted ? (
                  <VolumeX className="h-5 w-5" />
                ) : (
                  <Volume2 className="h-5 w-5" />
                )}
              </Button>
              <input
                type="range"
                min="0"
                max="100"
                value={volume * 100}
                onChange={(e) => handleVolumeChange([parseFloat(e.target.value)])}
                className="w-20 h-1 bg-white/30 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            {/* Fullscreen */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleFullscreen}
              className="text-white hover:text-primary"
            >
              <Maximize className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Speed Lock Notice (overlay when trying to change speed) */}
      {/* This would show if user tries to manipulate video speed */}
      <div className="absolute top-4 right-4 bg-destructive/90 text-white px-3 py-1 rounded text-sm opacity-0 pointer-events-none transition-opacity">
        ⚠️ Video hızı değiştirilemez
      </div>
    </div>
  );
}
