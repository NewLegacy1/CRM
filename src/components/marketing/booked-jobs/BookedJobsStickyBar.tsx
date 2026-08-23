"use client";

export function BookedJobsStickyBar() {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t-2 border-[#16120e] bg-[#f6f1e8] px-4 py-3 md:hidden">
      <a href="#audit-form" className="bj-cta">
        Show me where I’m losing money
      </a>
    </div>
  );
}
