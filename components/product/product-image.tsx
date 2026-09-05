import Image from "next/image";

// Renders the real product photo when one has been supplied; otherwise a
// clearly-labelled placeholder (never a fabricated "fake" product photo —
// spec section 43).
export function ProductImage({
  src,
  alt,
  className = "",
}: {
  src: string | null;
  alt: string;
  className?: string;
}) {
  if (src) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(max-width: 768px) 50vw, 25vw"
        className={`object-cover ${className}`}
      />
    );
  }

  return (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-2 bg-linen text-brown-500 ${className}`}
    >
      <svg viewBox="0 0 24 24" fill="none" className="h-9 w-9 opacity-60">
        <path
          d="M9 2h6l1 4h2a1 1 0 0 1 1 1v13a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a1 1 0 0 1 1-1h2l1-4Z"
          stroke="currentColor"
          strokeWidth="1.3"
        />
        <path d="M8 11c0 2.5 1.8 3 4 3s4-.5 4-3" stroke="currentColor" strokeWidth="1.3" />
      </svg>
      <span className="eyebrow text-center text-[10px] opacity-70">
        Product photo coming soon
      </span>
    </div>
  );
}
