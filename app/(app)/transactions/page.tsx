import { redirect } from "next/navigation";

import { CategoryBadge } from "@/components/category-badge";
import { ROUTES } from "@/config/routes";
import { listCategories } from "@/server/libs/categories";
import { getActiveHouseholdId } from "@/server/libs/households";
import { listTransactions } from "@/server/libs/transactions";

import { MonthSelector } from "./_components/month-selector";
import { ScrollAreaWithArrows } from "./_components/scroll-area-with-arrows";
import { currentMonth, monthRange, parseMonth } from "./_lib/month";

const amountFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});

const dateFormat = new Intl.DateTimeFormat(undefined, {
  weekday: "short",
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: "UTC",
});

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const month = parseMonth((await searchParams).month);
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);

  return (
    <main className="mx-auto flex h-[calc(100dvh-7rem)] max-w-md flex-col p-4 md:h-dvh">
      <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">History</h1>
      <MonthSelector month={month} currentMonth={currentMonth()}>
        <TransactionList householdId={householdId} month={month} />
      </MonthSelector>
    </main>
  );
}

const signed = (n: number) =>
  `${n < 0 ? "-" : "+"}${amountFormat.format(Math.abs(n))}`;

async function TransactionList({
  householdId,
  month,
}: {
  householdId: string;
  month: string;
}) {
  const [transactions, categories] = await Promise.all([
    listTransactions(householdId, monthRange(month)),
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
        <ScrollAreaWithArrows>
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
        </ScrollAreaWithArrows>
      </div>
    </div>
  );
}
