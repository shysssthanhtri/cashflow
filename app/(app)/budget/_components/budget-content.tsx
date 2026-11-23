import Link from "next/link";
import { getLocale, getTranslations } from "next-intl/server";
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

export async function BudgetContent({
  householdId,
  month,
}: {
  householdId: string;
  month: string;
}) {
  const t = await getTranslations("budget");
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
      <p className="px-2 py-6 text-sm text-muted-foreground">{t("empty")}</p>
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

async function BudgetRow({ item }: { item: BudgetProgress }) {
  const t = await getTranslations("budget");
  const amountFormat = new Intl.NumberFormat(await getLocale(), {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  });
  const fmt = (n: number) => amountFormat.format(n);
  const remaining = item.budget.amount - item.spent;
  const isCategory = item.icon !== null;
  const reached = item.spent >= item.budget.amount;
  const tone = item.saving
    ? reached
      ? "text-green-600"
      : "text-destructive"
    : item.over
      ? "text-destructive"
      : "text-muted-foreground";
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
          <span className="truncate text-sm font-medium">
            {isCategory ? item.name : t("overall")}
          </span>
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
      <p className={cn("text-xs", tone)}>
        {item.saving && remaining === 0
          ? t("targetReached")
          : item.over
            ? t(item.saving ? "overTarget" : "over", {
                amount: fmt(-remaining),
              })
            : t("left", { amount: fmt(remaining) })}
      </p>
    </Link>
  );
}
