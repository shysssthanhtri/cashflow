"use client";

import { ChevronDownIcon, ChevronUpIcon } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

const STEP = 8;

function ArrowButton({
  direction,
  onScrollStep,
}: {
  direction: "up" | "down";
  onScrollStep: (delta: number) => void;
}) {
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const delta = direction === "up" ? -STEP : STEP;

  const stop = () => {
    if (timer.current) clearInterval(timer.current);
    timer.current = null;
  };
  const start = () => {
    stop();
    timer.current = setInterval(() => onScrollStep(delta), 16);
  };
  useEffect(() => stop, []);

  const Icon = direction === "up" ? ChevronUpIcon : ChevronDownIcon;
  return (
    <div
      aria-hidden
      onPointerEnter={start}
      onPointerLeave={stop}
      onClick={() => onScrollStep(delta * 10)}
      className={cn(
        "absolute inset-x-0 z-10 flex cursor-default items-center justify-center bg-popover py-1",
        direction === "up" ? "top-0" : "bottom-0"
      )}
    >
      <Icon className="size-4" />
    </div>
  );
}

export function ScrollAreaWithArrows({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [canUp, setCanUp] = useState(false);
  const [canDown, setCanDown] = useState(false);

  const update = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    setCanUp(el.scrollTop > 0);
    setCanDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    if (el.firstElementChild) observer.observe(el.firstElementChild);
    return () => observer.disconnect();
  }, [update]);

  const scrollStep = (delta: number) => {
    ref.current?.scrollBy({ top: delta });
  };

  return (
    <div className={cn("relative min-h-0 flex-1", className)}>
      {canUp && <ArrowButton direction="up" onScrollStep={scrollStep} />}
      <div ref={ref} onScroll={update} className="h-full overflow-y-auto">
        <div>{children}</div>
      </div>
      {canDown && <ArrowButton direction="down" onScrollStep={scrollStep} />}
    </div>
  );
}
