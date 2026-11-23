import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { listBudgets } from "@/server/libs/budgets";
import { listCategories } from "@/server/libs/categories";
import { getActiveHouseholdSummary } from "@/server/libs/households";

import { currentMonth, parseMonth } from "../../transactions/_lib/month";
import { saveBudget } from "../_actions/save-budget";
import { BudgetForm } from "../_components/budget-form";
import { OVERALL } from "../_schemas/budget";

export default async function AddBudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const t = await getTranslations("budget");
  const month = parseMonth((await searchParams).month);
  const household = await getActiveHouseholdSummary();
  if (!household) redirect(ROUTES.households);
  const householdId = household.id;

  const [categories, budgets] = await Promise.all([
    listCategories(householdId),
    listBudgets(householdId, month, currentMonth()),
  ]);
  const taken = new Set(budgets.map((b) => b.categoryId));
  const options = [
    ...(taken.has(null) ? [] : [{ value: OVERALL, label: t("overall") }]),
    ...categories
      .filter((c) => c.type !== "income" && !c.parentId && !taken.has(c.id))
      .map((c) => ({ value: c.id, label: c.name })),
  ];

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={`${ROUTES.budget}?month=${month}`}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        {t("title")}
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">{t("addTitle")}</h1>
      <div className="px-2">
        {options.length === 0 ? (
          <p className="text-sm text-muted-foreground">{t("allBudgeted")}</p>
        ) : (
          <BudgetForm
            currency={household.currency}
            options={options}
            submitLabel={t("addSubmit")}
            action={saveBudget.bind(null, month)}
          />
        )}
      </div>
    </main>
  );
}
