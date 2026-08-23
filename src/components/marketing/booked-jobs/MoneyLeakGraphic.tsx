export function MoneyLeakGraphic() {
  return (
    <div className="bj-phone relative mx-auto w-full max-w-[22rem] p-4 sm:max-w-none sm:p-5">
      <div className="relative mb-4 flex items-center justify-between px-1">
        <span className="font-heading text-[10px] tracking-[0.22em] text-white/40">
          GOOGLE
        </span>
        <span className="text-[10px] text-cyan-200/70">Maps</span>
      </div>

      <div className="bj-search mb-4 rounded-2xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white/80">
        furnace repair near me
      </div>

      <div className="space-y-2.5">
        <Listing
          className="bj-listing bj-listing-1"
          name="Apex Heating"
          meta="Open now · 214 reviews"
          status="ring"
        />
        <Listing
          className="bj-listing bj-listing-2"
          name="Northshore HVAC"
          meta="Open now · 89 reviews"
          status="ring"
        />
        <Listing
          className="bj-listing bj-listing-3"
          name="Your shop"
          meta="Looks empty · voicemail"
          status="mute"
          yours
        />
      </div>

      <span className="bj-cash bj-cash-a" aria-hidden>
        $ job
      </span>
      <span className="bj-cash bj-cash-b" aria-hidden>
        $ job
      </span>

      <p className="relative mt-5 text-center text-[11px] leading-relaxed text-white/45">
        They call three names. The money goes to whoever answers.
      </p>
    </div>
  );
}

function Listing({
  className,
  name,
  meta,
  status,
  yours,
}: {
  className: string;
  name: string;
  meta: string;
  status: "ring" | "mute";
  yours?: boolean;
}) {
  return (
    <div
      className={`${className} flex items-center justify-between rounded-2xl border px-3 py-3 ${
        yours
          ? "border-rose-400/25 bg-rose-500/[0.06]"
          : "border-white/10 bg-white/[0.04]"
      }`}
    >
      <div>
        <p className="font-heading text-xs tracking-wide text-[#FAFAFA]">{name}</p>
        <p className="mt-0.5 text-[11px] text-white/45">{meta}</p>
      </div>
      <span className={status === "ring" ? "bj-ring" : "bj-mute"} aria-hidden />
    </div>
  );
}
