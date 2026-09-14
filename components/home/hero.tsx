import Image from "next/image";
import Link from "next/link";

const HERO_IMAGE_WIDTH = 1672;
const HERO_IMAGE_HEIGHT = 941;

export function Hero() {
  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container-page py-6 md:py-8">
        <div
          className="relative w-full"
          style={{ aspectRatio: `${HERO_IMAGE_WIDTH} / ${HERO_IMAGE_HEIGHT}` }}
        >
          <Image
            src="/images/shuddhodhan-oils-hero.png"
            alt="Shuddhodhan Wood Cold-Pressed Oils — pure ingredients, traditional extraction, nothing unnecessary. Mustard, sesame, groundnut, sunflower, virgin coconut, almond and castor oil bottles."
            fill
            priority
            sizes="(max-width: 1280px) 100vw, 1280px"
            className="object-contain"
          />

          {/* Invisible overlay over the "SHOP OUR OILS →" CTA baked into the
              artwork above — coordinates are the button's exact bounding box
              as a percentage of the source image (1672x941), measured once
              and fixed, so it stays correctly positioned at any render size. */}
          <Link
            href="/oils"
            aria-label="Shop our oils"
            className="absolute"
            style={{ left: "3.5%", top: "67.9%", width: "14.6%", height: "6.9%" }}
          />
        </div>
      </div>
    </section>
  );
}
