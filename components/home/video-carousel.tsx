"use client";

import { useState } from "react";
import Image from "next/image";
import type { VideoItem } from "@/lib/types";
import { ReelViewerModal } from "@/components/home/reel-viewer-modal";

const CATEGORY_LABELS: Record<VideoItem["category"], string> = {
  MANUFACTURING: "Manufacturing",
  WOOD_COLD_PRESSING: "Wood Cold Pressing",
  INGREDIENTS: "Ingredients",
  PRODUCT_DEMO: "Product Demo",
  OIL_EDUCATION: "Oil Education",
  BEHIND_THE_SCENES: "Behind the Scenes",
  STORE: "Our Store",
  FOUNDER_TEAM: "Founder & Team",
  CUSTOMER_EXPERIENCE: "Customer Experience",
  PRODUCT_USAGE: "Product Usage",
  BRAND_STORY: "Brand Story",
  OFFERS_CAMPAIGNS: "Offers",
};

export function VideoCarousel({ videos }: { videos: VideoItem[] }) {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <>
      <div className="no-scrollbar flex gap-4 overflow-x-auto pb-2 md:grid md:grid-cols-4 md:overflow-visible">
        {videos.map((video, index) => (
          <button
            key={video.video_id}
            onClick={() => setOpenIndex(index)}
            className="group relative w-40 shrink-0 overflow-hidden rounded-lg bg-linen text-left md:w-auto"
          >
            <div
              className={`relative w-full overflow-hidden ${
                video.aspect_ratio === "9:16" ? "aspect-[9/16]" : "aspect-video"
              }`}
            >
              <Image
                src={video.thumbnail}
                alt={video.title}
                fill
                sizes="(max-width: 768px) 160px, 25vw"
                className="object-cover transition-transform duration-300 group-hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-charcoal/20">
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-warm-white/90 text-brown-900">
                  ▶
                </span>
              </div>
            </div>
            <div className="p-2.5">
              <p className="line-clamp-2 text-xs font-medium text-brown-900">
                {video.title}
              </p>
              <p className="mt-1 text-[10px] uppercase tracking-wide text-brown-500">
                {CATEGORY_LABELS[video.category]}
              </p>
            </div>
          </button>
        ))}
      </div>

      {openIndex !== null && (
        <ReelViewerModal
          videos={videos}
          startIndex={openIndex}
          onClose={() => setOpenIndex(null)}
        />
      )}
    </>
  );
}
