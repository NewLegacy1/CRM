"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    Calendly?: {
      initInlineWidget: (options: { url: string; parentElement: HTMLElement }) => void;
    };
  }
}

const WIDGET_SCRIPT_SRC = "https://assets.calendly.com/assets/external/widget.js";

type CalendlyInlineEmbedProps = {
  url: string;
  className?: string;
};

/**
 * Inline Calendly scheduler. Loads widget.js once, uses initInlineWidget so it works
 * when navigating client-side in Next.js (not only on full page load).
 */
export function CalendlyInlineEmbed({ url, className }: CalendlyInlineEmbedProps) {
  const parentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = parentRef.current;
    if (!el) return;

    let cancelled = false;

    const mountWidget = () => {
      if (cancelled || !el || !window.Calendly) return;
      el.innerHTML = "";
      window.Calendly.initInlineWidget({ url, parentElement: el });
    };

    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${WIDGET_SCRIPT_SRC}"]`
    );

    if (window.Calendly) {
      mountWidget();
      return () => {
        cancelled = true;
        el.innerHTML = "";
      };
    }

    if (existingScript) {
      const onLoad = () => mountWidget();
      if (window.Calendly) {
        mountWidget();
      } else {
        existingScript.addEventListener("load", onLoad);
        queueMicrotask(() => {
          if (window.Calendly) mountWidget();
        });
      }
      return () => {
        cancelled = true;
        existingScript.removeEventListener("load", onLoad);
        el.innerHTML = "";
      };
    }

    const script = document.createElement("script");
    script.src = WIDGET_SCRIPT_SRC;
    script.async = true;
    script.onload = mountWidget;
    document.body.appendChild(script);

    return () => {
      cancelled = true;
      el.innerHTML = "";
    };
  }, [url]);

  return (
    <div
      ref={parentRef}
      className={className}
      style={{
        minWidth: 320,
        /* Match Calendly’s default embed height so the iframe gets a real box (avoids blank / collapsed embed). */
        height: 700,
        minHeight: 700,
      }}
    />
  );
}
