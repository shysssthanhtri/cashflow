import { notFound, redirect } from "next/navigation";

import { CategoryBadge } from "@/components/category-badge";
import { ROUTES } from "@/config/routes";
import { listCategories } from "@/server/libs/categories";
import { getActiveHouseholdId } from "@/server/libs/households";
import { listPeriods, type PeriodSummary } from "@/server/libs/periods";
import { listPeriodTransactions } from "@/server/libs/transactions";

import {
  type PeriodOption,
  PeriodSelector,
} from "./_components/period-selector";

const amountFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const shortDate = new Intl.DateTimeFormat(undefined, {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

const rangeLabel = (p: { startDate: string; endDate: string | null }) =>
  `${shortDate.format(new Date(`${p.startDate}T00:00:00Z`))} – ${
    p.endDate ? shortDate.format(new Date(`${p.endDate}T00:00:00Z`)) : "now"
  }`;

export default async function PeriodPage({
  params,
}: {
  params: Promise<{ periodId: string }>;
}) {
  const { periodId } = await params;
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);

  const periods = await listPeriods(householdId);
  const period = periods.find((p) => p.id === periodId);
  if (!period) notFound();

  const options = periods.map((p) => ({
    value: p.id,
    label: `${rangeLabel(p)}${p.status === "open" ? " (open)" : ""}`,
  }));

  return (
    <main className="mx-auto flex h-[calc(100dvh-7rem)] max-w-md flex-col p-4 md:h-dvh">
      <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">Periods</h1>
      <PeriodDetails
        householdId={householdId}
        period={period}
        options={options}
      />
    </main>
  );
}

const signed = (n: number) =>
  `${n < 0 ? "-" : "+"}${amountFormat.format(Math.abs(n))}`;

async function PeriodDetails({
  householdId,
  period,
  options,
}: {
  householdId: string;
  period: PeriodSummary;
  options: PeriodOption[];
}) {
  const [transactions, categories] = await Promise.all([
    listPeriodTransactions(period.id),
    listCategories(householdId),
  ]);
  const categoryOf = (id: string | null) => categories.find((c) => c.id === id);
  const delta = (t: (typeof transactions)[number]) =>
    t.type === "income" ? t.amount : -t.amount;

  const groups = new Map<string, typeof transactions>();
  for (const t of transactions) {
    groups.set(t.occurredAt, [...(groups.get(t.occurredAt) ?? []), t]);
  }

  const income = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);
  const expense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4">
      <PeriodSelector value={period.id} options={options} />
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border">
        <dl className="grid shrink-0 grid-cols-3 divide-x border-b">
          {[
            { label: "Income", value: amountFormat.format(income) },
            { label: "Expense", value: amountFormat.format(expense) },
            { label: "Net", value: signed(income - expense) },
          ].map(({ label, value }) => (
            <div key={label} className="px-4 py-3">
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="min-h-0 flex-1 overflow-y-auto">
          {transactions.length === 0 ? (
            <p className="px-4 py-6 text-sm text-muted-foreground">
              No transactions yet.
            </p>
          ) : (
            [...groups.entries()].map(([date, items]) => (
              <section key={date} className="px-4 pt-4 pb-2">
                <div className="flex items-baseline justify-between">
                  <h3 className="text-sm font-medium">
                    {dateFormat.format(new Date(`${date}T00:00:00Z`))}
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    Net {signed(items.reduce((sum, t) => sum + delta(t), 0))}
                  </span>
                </div>
                <ul className="relative mt-3">
                  {items.map((t, idx) => {
                    const category = categoryOf(t.categoryId);
                    const parent = categoryOf(category?.parentId ?? null);
                    return (
                      <li key={t.id} className="relative flex gap-3 pb-4">
                        {idx < items.length - 1 && (
                          <span className="absolute top-3 bottom-0 left-[5px] w-px bg-border" />
                        )}
                        <span
                          className="relative mt-1.5 size-[11px] shrink-0 rounded-full"
                          style={{
                            backgroundColor: category?.color ?? "#a1a1aa",
                          }}
                        />
                        <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                          <div className="min-w-0">
                            {t.note && (
                              <p className="truncate text-sm">{t.note}</p>
                            )}
                            {category && (
                              <CategoryBadge
                                icon={category.icon}
                                color={category.color}
                                className={`gap-1 py-0.5 pr-2 pl-1.5 text-xs [&_svg]:size-3! [&>span:first-child]:size-4! ${t.note ? "mt-1" : ""}`}
                              >
                                {parent
                                  ? `${parent.name} / ${category.name}`
                                  : category.name}
                              </CategoryBadge>
                            )}
                          </div>
                          <span
                            className={
                              t.type === "income"
                                ? "text-sm font-medium text-green-600"
                                : "text-sm font-medium"
                            }
                          >
                            {signed(delta(t))}
                          </span>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </section>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
