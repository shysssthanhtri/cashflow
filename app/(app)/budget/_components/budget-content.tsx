import Link from "next/link";
import type { CSSProperties } from "react";

import { CategoryIcon } from "@/components/category-icon";
import { Progress } from "@/components/ui/progress";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";
import { listBudgets } from "@/server/libs/budgets";
import { listCategories } from "@/server/libs/categories";
import { listTransactions } from "@/server/libs/transactions";

import { currentMonth, monthRange } from "../../transactions/_lib/month";
import { type BudgetProgress, budgetProgress } from "../_lib/budget";

const amountFormat = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 0,
  maximumFractionDigits: 2,
});
const fmt = (n: number) => amountFormat.format(n);

export async function BudgetContent({
  householdId,
  month,
}: {
  householdId: string;
  month: string;
}) {
  const [budgets, categories, transactions] = await Promise.all([
    listBudgets(householdId, month, currentMonth()),
    listCategories(householdId),
    listTransactions(householdId, monthRange(month)),
  ]);
  const { overall, categories: rows } = budgetProgress(
    budgets,
    categories,
    transactions
  );

  if (!overall && rows.length === 0) {
    return (
      <p className="px-2 py-6 text-sm text-muted-foreground">
        No budgets for this month.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {overall && (
        <section className="rounded-xl border p-4">
          <BudgetRow item={overall} />
        </section>
      )}
      {rows.length > 0 && (
        <ul className="flex flex-col gap-4 rounded-xl border p-4">
          {rows.map((item) => (
            <li key={item.budget.id}>
              <BudgetRow item={item} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function BudgetRow({ item }: { item: BudgetProgress }) {
  const remaining = item.budget.amount - item.spent;
  const isCategory = item.icon !== null;
  return (
    <Link
      href={ROUTES.budgetEdit(item.budget.id)}
      className="flex flex-col gap-2"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {item.icon && (
            <CategoryIcon
              icon={item.icon}
              color={item.color}
              className="size-7"
            />
          )}
          <span className="truncate text-sm font-medium">{item.name}</span>
        </div>
        <span className="text-sm text-muted-foreground">
          {fmt(item.spent)} / {fmt(item.budget.amount)}
        </span>
      </div>
      <Progress
        value={item.ratio * 100}
        style={
          isCategory ? ({ "--bar": item.color } as CSSProperties) : undefined
        }
        className={cn(
          "[&_[data-slot=progress-indicator]]:rounded-full [&_[data-slot=progress-track]]:h-2 [&_[data-slot=progress-track]]:rounded-full",
          isCategory
            ? "[&_[data-slot=progress-indicator]]:bg-(--bar)"
            : item.over && "[&_[data-slot=progress-indicator]]:bg-destructive"
        )}
      />
      <p
        className={
          item.over
            ? "text-xs text-destructive"
            : "text-xs text-muted-foreground"
        }
      >
        {item.over ? `${fmt(-remaining)} over` : `${fmt(remaining)} left`}
      </p>
    </Link>
  );
}
