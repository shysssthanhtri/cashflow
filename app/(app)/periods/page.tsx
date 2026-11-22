import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { listCategories } from "@/server/libs/categories";
import { getActiveHouseholdId } from "@/server/libs/households";
import { getOpenPeriod } from "@/server/libs/periods";
import { listPeriodTransactions } from "@/server/libs/transactions";

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

export default async function PeriodsPage() {
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);

  const period = await getOpenPeriod(householdId);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">Periods</h1>
      {period ? (
        <OpenPeriod householdId={householdId} period={period} />
      ) : (
        <div className="px-2">
          <p className="pb-3 text-sm text-muted-foreground">
            There is no open period.
          </p>
          <Link href={ROUTES.periodsAdd} className={buttonVariants()}>
            Start a period
          </Link>
        </div>
      )}
    </main>
  );
}

const signed = (n: number) =>
  `${n < 0 ? "-" : "+"}${amountFormat.format(Math.abs(n))}`;

async function OpenPeriod({
  householdId,
  period,
}: {
  householdId: string;
  period: { id: string; startDate: string };
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
    <div className="overflow-hidden rounded-xl border">
      <div className="px-4 pt-4 pb-3">
        <h2 className="font-semibold">Transactions this period</h2>
        <p className="text-sm text-muted-foreground">
          Open since{" "}
          {dateFormat.format(new Date(`${period.startDate}T00:00:00Z`))}
        </p>
      </div>
      <dl className="grid grid-cols-3 divide-x border-y">
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
                      style={{ backgroundColor: category?.color ?? "#a1a1aa" }}
                    />
                    <div className="flex min-w-0 flex-1 items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="truncate text-sm">
                          {t.note ?? category?.name ?? "Transaction"}
                        </p>
                        {category && t.note && (
                          <p className="truncate text-xs text-muted-foreground">
                            {parent
                              ? `${parent.name} / ${category.name}`
                              : category.name}
                          </p>
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
  );
}
