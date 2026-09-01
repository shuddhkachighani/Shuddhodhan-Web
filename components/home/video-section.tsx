import { getActiveVideos } from "@/lib/data/videos";
import { VideoCarousel } from "@/components/home/video-carousel";

function videoObjectJsonLd(video: ReturnType<typeof getActiveVideos>[number]) {
  return {
    "@context": "https://schema.org",
    "@type": "VideoObject",
    name: video.title,
    description: video.description,
    thumbnailUrl: [video.thumbnail],
    uploadDate: video.published_date,
    duration: `PT${video.duration_seconds}S`,
    contentUrl: video.video_url,
  };
}

export function VideoSection() {
  const videos = getActiveVideos();

  return (
    <section id="reels" className="bg-brown-900 py-16 text-warm-white md:py-20">
      <div className="container-page">
        <div className="max-w-xl">
          <p className="eyebrow text-mustard-light">See Shuddhodhan In Action</p>
          <h2 className="mt-3 font-serif text-3xl sm:text-4xl">
            Real process. Real products. Real Shuddhodhan.
          </h2>
          <p className="mt-3 text-warm-white/70">
            From our process to your kitchen — see the real Shuddhodhan story.
          </p>
        </div>

        <div className="mt-10">
          {videos.length > 0 ? (
            <VideoCarousel videos={videos} />
          ) : (
            <div className="rounded-lg border border-dashed border-warm-white/25 px-6 py-14 text-center">
              <p className="text-sm text-warm-white/70">
                Real Shuddhodhan process videos and Reels are being added here soon.
              </p>
            </div>
          )}
        </div>

        {videos.map((video) => (
          <script
            key={video.video_id}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(videoObjectJsonLd(video)) }}
          />
        ))}
      </div>
    </section>
  );
}
