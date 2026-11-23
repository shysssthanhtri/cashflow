import { getLocale, getTranslations } from "next-intl/server";

import { cn } from "@/lib/utils";
import { listCategories } from "@/server/libs/categories";
import { listTransactions } from "@/server/libs/transactions";

import { monthRange, shiftMonth } from "../../transactions/_lib/month";
import { byCategory, totals } from "../_lib/report";
import { CategoryBreakdown } from "./category-breakdown";
import { TrendChart } from "./trend-chart";

const TREND_MONTHS = 12;
const TREND_CATEGORIES = 5;

const change = (now: number, prev: number) =>
  prev > 0
    ? `${now >= prev ? "+" : "-"}${Math.round((Math.abs(now - prev) / prev) * 100)}%`
    : "—";
const percent = (n: number) => `${Math.round(n * 100)}%`;

export async function ReportContent({
  householdId,
  month,
}: {
  householdId: string;
  month: string;
}) {
  const tr = await getTranslations("report");
  const locale = await getLocale();
  const amountFormat = new Intl.NumberFormat(locale, {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const monthFormat = new Intl.DateTimeFormat(locale, {
    month: "short",
    timeZone: "UTC",
  });
  const fmt = (n: number) => amountFormat.format(n);
  const signed = (n: number) => `${n < 0 ? "-" : "+"}${fmt(Math.abs(n))}`;
  const trendMonths = Array.from({ length: TREND_MONTHS }, (_, i) =>
    shiftMonth(month, i - (TREND_MONTHS - 1))
  );
  const [all, categories] = await Promise.all([
    listTransactions(householdId, {
      from: monthRange(trendMonths[0]).from,
      to: monthRange(month).to,
    }),
    listCategories(householdId),
  ]);

  const inMonth = (m: string) =>
    all.filter((t) => t.occurredAt.slice(0, 7) === m);
  const current = inMonth(month);
  const now = totals(current);
  const previous = totals(inMonth(shiftMonth(month, -1)));
  const trend = trendMonths.map((m) => ({ month: m, ...totals(inMonth(m)) }));

  const topCategories = byCategory(
    all.filter((t) => trendMonths.includes(t.occurredAt.slice(0, 7))),
    categories,
    "expense"
  )
    .sort((a, b) => b.amount - a.amount)
    .slice(0, TREND_CATEGORIES);
  const categoryTrend = trendMonths.map((m) => {
    const row: Record<string, number | string> = {
      month: m,
      label: monthFormat.format(new Date(`${m}-01T00:00:00Z`)),
    };
    const shares = byCategory(inMonth(m), categories, "expense");
    topCategories.forEach((c, i) => {
      row[`c${i}`] = shares.find((x) => x.id === c.id)?.amount ?? 0;
    });
    return row;
  });

  const expenses = byCategory(current, categories, "expense");
  const incomes = byCategory(current, categories, "income");
  const topExpenses = current
    .filter((t) => t.type === "expense")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);
  const categoryName = (id: string | null) =>
    categories.find((c) => c.id === id)?.name ?? tr("uncategorized");

  if (current.length === 0) {
    return (
      <p className="px-2 py-6 text-sm text-muted-foreground">{tr("empty")}</p>
    );
  }

  const savingsRate =
    now.income > 0 ? (now.net + now.saving) / now.income : null;

  return (
    <div className="flex flex-col gap-4">
      <section className="rounded-xl border">
        <dl className="grid grid-cols-2 border-b">
          {[
            { label: tr("income"), value: fmt(now.income) },
            { label: tr("expense"), value: fmt(now.expense) },
            { label: tr("saving"), value: fmt(now.saving) },
            { label: tr("net"), value: signed(now.net) },
          ].map(({ label, value }, i) => (
            <div
              key={label}
              className={cn(
                "px-4 py-3",
                i % 2 === 0 && "border-r",
                i < 2 && "border-b"
              )}
            >
              <dt className="text-xs text-muted-foreground">{label}</dt>
              <dd className="font-semibold">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-col gap-1 px-4 py-3 text-sm">
          <Row
            label={tr("savingsRate")}
            value={savingsRate === null ? "—" : percent(savingsRate)}
          />
          <Row
            label={tr("expenseVsLast")}
            value={change(now.expense, previous.expense)}
          />
          <Row
            label={tr("incomeVsLast")}
            value={change(now.income, previous.income)}
          />
        </div>
      </section>

      <Card title={tr("trend")}>
        <TrendChart
          categories={topCategories.map((c) => ({
            name: c.id === null ? tr("uncategorized") : c.name,
            color: c.color,
          }))}
          categoryData={categoryTrend}
          data={trend.map((m) => ({
            ...m,
            label: monthFormat.format(new Date(`${m.month}-01T00:00:00Z`)),
          }))}
        />
      </Card>

      <Card title={tr("breakdown")}>
        <CategoryBreakdown expenses={expenses} incomes={incomes} />
      </Card>

      {topExpenses.length > 0 && (
        <Card title={tr("biggestExpenses")}>
          <ul className="flex flex-col gap-3">
            {topExpenses.map((t) => (
              <li
                key={t.id}
                className="flex items-baseline justify-between gap-3 text-sm"
              >
                <div className="min-w-0">
                  <p className="truncate">
                    {t.note || categoryName(t.categoryId)}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {t.occurredAt}
                  </p>
                </div>
                <span className="font-medium">-{fmt(t.amount)}</span>
              </li>
            ))}
          </ul>
        </Card>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className="font-medium">{value}</span>
    </div>
  );
}

function Card({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border p-4">
      <h2 className="mb-3 text-sm font-medium">{title}</h2>
      {children}
    </section>
  );
}
