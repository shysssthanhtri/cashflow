"use client";

import { useEffect, useState } from "react";

// Rendered in the server HTML so it paints before JS loads; faded out and
// unmounted by React once hydrated (never remove the node manually).
export function SplashScreen() {
  const [phase, setPhase] = useState<"show" | "fade" | "gone">("show");

  useEffect(() => {
    const fade = setTimeout(() => setPhase("fade"), 0);
    const gone = setTimeout(() => setPhase("gone"), 300);
    return () => {
      clearTimeout(fade);
      clearTimeout(gone);
    };
  }, []);

  if (phase === "gone") return null;

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center bg-background transition-opacity duration-300 ${phase === "fade" ? "pointer-events-none opacity-0" : ""}`}
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
