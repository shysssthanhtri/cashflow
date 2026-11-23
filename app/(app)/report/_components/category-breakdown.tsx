"use client";

import { useLocale, useTranslations } from "next-intl";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { CategoryShare } from "../_lib/report";

export function CategoryBreakdown({
  expenses,
  incomes,
}: {
  expenses: CategoryShare[];
  incomes: CategoryShare[];
}) {
  const t = useTranslations("report");
  return (
    <Tabs defaultValue="went">
      <TabsList>
        <TabsTrigger value="went">{t("went")}</TabsTrigger>
        <TabsTrigger value="come">{t("came")}</TabsTrigger>
      </TabsList>
      <TabsContent value="went">
        <CategoryBars items={expenses} />
      </TabsContent>
      <TabsContent value="come">
        <CategoryBars items={incomes} />
      </TabsContent>
    </Tabs>
  );
}

function CategoryBars({ items }: { items: CategoryShare[] }) {
  const t = useTranslations("report");
  const amountFormat = new Intl.NumberFormat(useLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{t("nothing")}</p>;
  }
  return (
    <ul className="flex flex-col gap-3 pt-1">
      {items.map((c) => (
        <li key={c.id ?? "none"}>
          <div className="flex items-baseline justify-between text-sm">
            <span>{c.id === null ? t("uncategorized") : c.name}</span>
            <span className="text-muted-foreground">
              {amountFormat.format(c.amount)} · {Math.round(c.share * 100)}%
            </span>
          </div>
          <div className="mt-1 h-2 rounded-full bg-muted">
            <div
              className="h-full rounded-full"
              style={{ width: `${c.share * 100}%`, backgroundColor: c.color }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
