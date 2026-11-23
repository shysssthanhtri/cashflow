import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { getBudget } from "@/server/libs/budgets";
import { listCategories } from "@/server/libs/categories";
import { getActiveHouseholdSummary } from "@/server/libs/households";

import { deleteBudget, saveBudget } from "../../_actions/save-budget";
import { BudgetForm } from "../../_components/budget-form";
import { OVERALL } from "../../_schemas/budget";

export default async function EditBudgetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const t = await getTranslations("budget");
  const { id } = await params;
  const household = await getActiveHouseholdSummary();
  if (!household) redirect(ROUTES.households);
  const householdId = household.id;

  const [budget, categories] = await Promise.all([
    getBudget(householdId, id),
    listCategories(householdId),
  ]);
  if (!budget) notFound();
  const month = budget.month.slice(0, 7);

  const categoryId = budget.category_id ?? OVERALL;
  const label =
    categories.find((c) => c.id === budget.category_id)?.name ?? t("overall");

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={`${ROUTES.budget}?month=${month}`}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        {t("title")}
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">{t("editTitle")}</h1>
      <div className="px-2">
        <BudgetForm
          currency={household.currency}
          options={[{ value: categoryId, label }]}
          categoryLocked
          submitLabel={t("saveChanges")}
          action={saveBudget.bind(null, month)}
          onDelete={deleteBudget.bind(null, id, month)}
          defaultValues={{
            categoryId,
            amount: String(budget.amount),
            recurring: budget.recurring,
          }}
        />
      </div>
    </main>
  );
}
