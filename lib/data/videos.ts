import type { VideoItem } from "@/lib/types";

// Data-driven video/Reels CMS structure (see spec section 12).
// Intentionally empty: no real Shuddhodhan video files/URLs have been supplied
// yet, and titles/descriptions must never be invented. Populate this array with
// real video_id/title/thumbnail/video_url entries (local file, CDN, or
// YouTube/Instagram URL) to activate the "See Shuddhodhan in Action" section —
// no component changes are required.
export const videos: VideoItem[] = [];

export function getActiveVideos(): VideoItem[] {
  return videos
    .filter((v) => v.active)
    .sort((a, b) => (a.featured === b.featured ? 0 : a.featured ? -1 : 1));
}
