"use client";

import { useEffect, type ReactNode } from "react";

export function BookedJobsTheme({ children }: { children: ReactNode }) {
  useEffect(() => {
    const html = document.documentElement;
    html.classList.remove("dark");
    html.classList.add("bj-light");
    return () => {
      html.classList.remove("bj-light");
      html.classList.add("dark");
    };
  }, []);

  return <div className="bj-theme">{children}</div>;
}
