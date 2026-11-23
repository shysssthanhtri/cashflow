"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState, useSyncExternalStore } from "react";
import { CartesianGrid, LabelList, Line, LineChart, XAxis } from "recharts";

import {
  type ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TrendPoint = {
  month: string;
  label: string;
  income: number;
  expense: number;
  saving: number;
};

const MOBILE_MONTHS = 6;
const QUERY = "(max-width: 767px)";

const COLORS = {
  income: "#16a34a",
  expense: "#f43f5e",
  saving: "#3b82f6",
} as const;

function subscribe(cb: () => void) {
  const mq = window.matchMedia(QUERY);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

type Mode = "cashflow" | "category";

export function TrendChart({
  data,
  categories,
  categoryData,
}: {
  data: TrendPoint[];
  categories: { name: string; color: string }[];
  categoryData: Record<string, number | string>[];
}) {
  const t = useTranslations("report");
  const compact = new Intl.NumberFormat(useLocale(), {
    notation: "compact",
    maximumFractionDigits: 1,
  });
  const config = {
    income: { label: t("income"), color: COLORS.income },
    expense: { label: t("expense"), color: COLORS.expense },
    saving: { label: t("saving"), color: COLORS.saving },
  } satisfies ChartConfig;
  const [mode, setMode] = useState<Mode>("cashflow");
  const [hidden, setHidden] = useState<string[]>([]);
  const isMobile = useSyncExternalStore(
    subscribe,
    () => window.matchMedia(QUERY).matches,
    () => false
  );
  const visible = <T,>(rows: T[]) =>
    isMobile ? rows.slice(-MOBILE_MONTHS) : rows;

  const categoryConfig = Object.fromEntries(
    categories.map((c, i) => [`c${i}`, { label: c.name, color: c.color }])
  ) satisfies ChartConfig;

  const activeConfig: Record<string, { label: string; color: string }> =
    mode === "cashflow" ? config : categoryConfig;

  const lines =
    mode === "cashflow"
      ? Object.keys(config)
      : categories.map((_, i) => `c${i}`);

  return (
    <div className="flex flex-col gap-3">
      <Tabs
        value={mode}
        onValueChange={(v) => {
          setMode(v as Mode);
          setHidden([]);
        }}
      >
        <TabsList>
          <TabsTrigger value="cashflow">{t("cashflow")}</TabsTrigger>
          <TabsTrigger value="category">{t("category")}</TabsTrigger>
        </TabsList>
      </Tabs>
      <ChartContainer config={activeConfig} className="h-56 w-full">
        <LineChart
          accessibilityLayer
          data={visible(mode === "cashflow" ? data : categoryData)}
          margin={{ top: 20, right: 16, bottom: 0, left: 16 }}
        >
          <CartesianGrid vertical={false} />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
          />
          {/* Mobile cashflow shows value labels; category lines would overlap, so tap for tooltip */}
          {(!isMobile || mode === "category") && (
            <ChartTooltip content={<ChartTooltipContent />} />
          )}
          {lines.map((key) => (
            <Line
              key={`${mode}-${key}`}
              dataKey={key}
              hide={hidden.includes(key)}
              type="monotone"
              stroke={`var(--color-${key})`}
              strokeWidth={2}
              dot={{ r: 3 }}
            >
              {isMobile && mode === "cashflow" && (
                <LabelList
                  dataKey={key}
                  position={key === "expense" ? "bottom" : "top"}
                  offset={8}
                  className="fill-foreground text-[10px]"
                  formatter={(v: unknown) => compact.format(Number(v))}
                />
              )}
            </Line>
          ))}
        </LineChart>
      </ChartContainer>
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-1">
        {lines.map((key) => {
          const item = activeConfig[key];
          const off = hidden.includes(key);
          return (
            <button
              key={key}
              type="button"
              aria-pressed={!off}
              className={`flex items-center gap-1.5 text-xs ${off ? "line-through opacity-40" : ""}`}
              onClick={() =>
                setHidden((h) =>
                  off ? h.filter((k) => k !== key) : [...h, key]
                )
              }
            >
              <span
                className="size-2 rounded-[2px]"
                style={{ backgroundColor: item.color }}
              />
              {item.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
