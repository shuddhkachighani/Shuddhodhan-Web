"use client";

import { useEffect, useRef, useState } from "react";
import type { VideoItem } from "@/lib/types";

export function ReelViewerModal({
  videos,
  startIndex,
  onClose,
}: {
  videos: VideoItem[];
  startIndex: number;
  onClose: () => void;
}) {
  const [index, setIndex] = useState(startIndex);
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const active = videos[index];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, videos.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [videos.length, onClose]);

  if (!active) return null;

  const aspectClass =
    active.aspect_ratio === "9:16"
      ? "aspect-[9/16] max-h-[85vh]"
      : active.aspect_ratio === "1:1"
        ? "aspect-square"
        : "aspect-video";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-charcoal/90 p-4">
      <button
        aria-label="Close video"
        onClick={onClose}
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-warm-white/10 text-2xl text-warm-white hover:bg-warm-white/20"
      >
        ×
      </button>

      {index > 0 && (
        <button
          aria-label="Previous video"
          onClick={() => setIndex((i) => i - 1)}
          className="absolute left-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/10 text-warm-white hover:bg-warm-white/20 sm:flex"
        >
          ‹
        </button>
      )}
      {index < videos.length - 1 && (
        <button
          aria-label="Next video"
          onClick={() => setIndex((i) => i + 1)}
          className="absolute right-2 top-1/2 hidden h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-warm-white/10 text-warm-white hover:bg-warm-white/20 sm:flex"
        >
          ›
        </button>
      )}

      <div className={`relative w-full max-w-sm overflow-hidden rounded-lg bg-black ${aspectClass}`}>
        <video
          ref={videoRef}
          src={active.video_url}
          poster={active.thumbnail}
          className="h-full w-full object-contain"
          autoPlay
          muted={muted}
          controls
          playsInline
        />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <p className="text-sm font-medium text-white">{active.title}</p>
        </div>
        <button
          onClick={() => setMuted((m) => !m)}
          className="absolute bottom-4 right-4 rounded-full bg-black/50 px-3 py-1.5 text-xs font-medium text-white"
        >
          {muted ? "Unmute" : "Mute"}
        </button>
      </div>
    </div>
  );
}
