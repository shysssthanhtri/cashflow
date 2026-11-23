"use client";

import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useRef, useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ROUTES } from "@/config/routes";

import { shiftMonth } from "../_lib/month";

const MONTH_LABELS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

const HISTORY_YEARS = 10;
const SWIPE_DISTANCE = 60;

export function MonthSelector({
  month,
  currentMonth,
  children,
}: {
  month: string;
  currentMonth: string;
  children: ReactNode;
}) {
  const router = useRouter();
  const start = useRef<{ x: number; y: number } | null>(null);

  const prev = shiftMonth(month, -1);
  const next = shiftMonth(month, 1);
  const canGoNext = month < currentMonth;

  const year = month.slice(0, 4);
  const scroller = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const currentYear = Number(currentMonth.slice(0, 4));
  const firstYear = Math.min(currentYear - (HISTORY_YEARS - 1), Number(year));
  const years = Array.from({ length: currentYear - firstYear + 1 }, (_, i) =>
    String(currentYear - i)
  );
  const months = Array.from(
    { length: 12 },
    (_, i) => `${year}-${String(i + 1).padStart(2, "0")}`
  );

  function selectYear(value: string | null) {
    if (!value) return;
    const target = `${value}-${month.slice(5)}`;
    go(target > currentMonth ? currentMonth : target);
  }

  function updateArrows() {
    const el = scroller.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 1);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }

  function scrollBy(dir: number) {
    const el = scroller.current;
    el?.scrollBy({ left: dir * el.clientWidth * 0.8, behavior: "smooth" });
  }

  useEffect(() => {
    const el = scroller.current;
    el?.querySelector('[data-selected="true"]')?.scrollIntoView({
      inline: "center",
      block: "nearest",
    });
    updateArrows();
    window.addEventListener("resize", updateArrows);
    return () => window.removeEventListener("resize", updateArrows);
  }, [month]);

  function go(target: string) {
    router.push(`${ROUTES.transactions}?month=${target}`);
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (!start.current) return;
    const dx = e.changedTouches[0].clientX - start.current.x;
    const dy = e.changedTouches[0].clientY - start.current.y;
    start.current = null;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5)
      return;
    if (dx > 0) go(prev);
    else if (canGoNext) go(next);
  }

  return (
    <div
      className="flex min-h-0 flex-1 flex-col gap-4"
      onTouchStart={(e) => {
        start.current = {
          x: e.touches[0].clientX,
          y: e.touches[0].clientY,
        };
      }}
      onTouchEnd={onTouchEnd}
    >
      <div className="flex shrink-0 flex-col gap-2">
        <Select value={year} onValueChange={selectYear}>
          <SelectTrigger
            aria-label="Year"
            className="mx-auto w-28 justify-center font-medium"
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <div className="flex items-center gap-1">
          {canScrollLeft && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Scroll months left"
              onClick={() => scrollBy(-1)}
            >
              <ChevronLeftIcon />
            </Button>
          )}
          <div
            ref={scroller}
            className="flex min-w-0 flex-1 [scrollbar-width:none] gap-1.5 overflow-x-auto pb-1 [&::-webkit-scrollbar]:hidden"
            onScroll={updateArrows}
            onTouchStart={(e) => e.stopPropagation()}
            onTouchEnd={(e) => e.stopPropagation()}
          >
            {months.map((value) => {
              const label = MONTH_LABELS[Number(value.slice(5)) - 1];
              return (
                <Badge
                  key={value}
                  variant={value === month ? "default" : "outline"}
                  className="h-7 shrink-0 cursor-pointer px-3 disabled:pointer-events-none disabled:opacity-40"
                  render={
                    <button
                      type="button"
                      disabled={value > currentMonth}
                      aria-pressed={value === month}
                      data-selected={value === month}
                      onClick={() => go(value)}
                    />
                  }
                >
                  {label}
                </Badge>
              );
            })}
          </div>
          {canScrollRight && (
            <Button
              variant="ghost"
              size="icon-sm"
              aria-label="Scroll months right"
              onClick={() => scrollBy(1)}
            >
              <ChevronRightIcon />
            </Button>
          )}
        </div>
      </div>
      {children}
    </div>
  );
}
