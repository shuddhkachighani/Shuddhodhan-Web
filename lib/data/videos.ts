import type { VideoItem } from "@/lib/types";

// Data-driven video/Reels CMS structure (see spec section 12).
// Real Shuddhodhan-supplied MP4s, transcoded to 720p/H.264 for web delivery
// (source files were 1080p, ~50MB combined; see public/videos/reels/). Titles
// are taken directly from the filenames the business supplied, not invented;
// descriptions are kept factual/generic rather than asserting anything not
// visible in the footage itself. Add more entries here (local file, CDN, or
// YouTube/Instagram URL) as more Reels are supplied — no component changes
// are required.
export const videos: VideoItem[] = [
  {
    video_id: "why-kachi-ghani",
    title: "Why Kachi Ghani",
    description: "A look at why Shuddhodhan presses oil the traditional Kachi Ghani way.",
    category: "OIL_EDUCATION",
    thumbnail: "/videos/reels/why-kachi-ghani-poster.jpg",
    video_url: "/videos/reels/why-kachi-ghani.mp4",
    aspect_ratio: "9:16",
    duration_seconds: 30,
    published_date: "2026-09-01",
    featured: true,
    active: true,
  },
  {
    video_id: "kachi-ghani-oil-03",
    title: "Kachi Ghani Oil",
    description: "Behind the scenes at the Shuddhodhan wooden Kachi Ghani press.",
    category: "WOOD_COLD_PRESSING",
    thumbnail: "/videos/reels/kachi-ghani-oil-03-poster.jpg",
    video_url: "/videos/reels/kachi-ghani-oil-03.mp4",
    aspect_ratio: "9:16",
    duration_seconds: 13,
    published_date: "2026-09-01",
    featured: true,
    active: true,
  },
];

export function getActiveVideos(): VideoItem[] {
  return videos
    .filter((v) => v.active)
    .sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
}
