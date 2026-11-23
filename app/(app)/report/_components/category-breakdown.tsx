"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

import type { CategoryShare } from "../_lib/report";

const amountFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

export function CategoryBreakdown({
  expenses,
  incomes,
}: {
  expenses: CategoryShare[];
  incomes: CategoryShare[];
}) {
  return (
    <Tabs defaultValue="went">
      <TabsList>
        <TabsTrigger value="went">Went</TabsTrigger>
        <TabsTrigger value="come">Came</TabsTrigger>
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
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">Nothing this month.</p>;
  }
  return (
    <ul className="flex flex-col gap-3 pt-1">
      {items.map((c) => (
        <li key={c.id ?? "none"}>
          <div className="flex items-baseline justify-between text-sm">
            <span>{c.name}</span>
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
