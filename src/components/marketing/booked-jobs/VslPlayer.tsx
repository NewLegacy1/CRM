"use client";

type VslPlayerProps = {
  title: string;
  caption: string;
};

export function VslPlayer({ title, caption }: VslPlayerProps) {
  const src = process.env.NEXT_PUBLIC_VSL_A_URL;

  if (src) {
    return (
      <div className="overflow-hidden rounded-xl bg-black ring-1 ring-white/10">
        <iframe
          src={src}
          title={title}
          className="aspect-video w-full"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  return (
    <div className="flex aspect-video flex-col items-center justify-center rounded-xl bg-black/70 px-6 text-center ring-1 ring-white/10">
      <p className="font-heading text-lg text-[#FAFAFA] sm:text-xl">{title}</p>
      <p className="mt-3 max-w-md text-sm leading-relaxed text-white/65">{caption}</p>
      <p className="mt-6 text-xs uppercase tracking-[0.2em] text-white/35">
        Video uploads after recording
      </p>
    </div>
  );
}
