"use client";

import { useEffect } from "react";

const SPLASH_ID = "app-splash";

// Rendered in the server HTML so it paints before JS loads; removed once hydrated.
export function SplashScreen() {
  useEffect(() => {
    // Drop the marker added by the service worker's cold-start shell.
    const url = new URL(window.location.href);
    if (url.searchParams.has("_s")) {
      url.searchParams.delete("_s");
      window.history.replaceState(null, "", url);
    }
    const el = document.getElementById(SPLASH_ID);
    if (!el) return;
    el.style.opacity = "0";
    const t = setTimeout(() => el.remove(), 300);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      id={SPLASH_ID}
      suppressHydrationWarning
      className="fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/icon-192x192.png"
        alt=""
        width={96}
        height={96}
        className="animate-pulse rounded-2xl"
      />
    </div>
  );
}
