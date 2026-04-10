/** Shared field chrome for marketing / galaxy intake and lead flows */

export const marketingFormLabelClasses = "text-sm font-medium text-white/80";

export const marketingFormFieldClasses =
  "w-full rounded-[0.875rem] border border-white/[0.12] bg-white/[0.04] px-3 py-2.5 text-sm text-[#FAFAFA] placeholder:text-white/40 shadow-none transition-colors focus-visible:border-violet-400/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/20 disabled:cursor-not-allowed disabled:opacity-50";

export const marketingFormTextareaClasses = `${marketingFormFieldClasses} min-h-[100px] resize-y`;

/** Native `<select>`: solid bg + dark color-scheme so OS dropdown options aren’t white-on-white */
export const marketingFormSelectClasses = [
  "w-full rounded-[0.875rem] border border-white/[0.12] bg-zinc-950 px-3 py-2.5 text-sm text-zinc-100 shadow-none transition-colors",
  "focus-visible:border-violet-400/55 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/20",
  "h-11 min-h-[2.75rem] cursor-pointer appearance-none pr-10 [color-scheme:dark]",
  "[&>option]:bg-zinc-950 [&>option]:text-zinc-100",
].join(" ");

/** Section card inside an intake wizard step */
export const marketingIntakePanelClasses =
  "rounded-[calc(1.25rem-1px)] card-galaxy-glass p-6 ring-1 ring-white/[0.08] md:p-8";

export const marketingIntakeOuterNeonClasses = "rounded-[1.25rem] border-galaxy-neon";
