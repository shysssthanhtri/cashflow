import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { listCategories, listTopCategoryIds } from "@/server/libs/categories";
import { getActiveHouseholdSummary } from "@/server/libs/households";

import { TransactionForm } from "./_components/transaction-form";

export default async function AddPage() {
  const t = await getTranslations("transactions");
  const household = await getActiveHouseholdSummary();
  if (!household) redirect(ROUTES.households);
  const [categories, topCategoryIds] = await Promise.all([
    listCategories(household.id),
    listTopCategoryIds(household.id),
  ]);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">{t("addTitle")}</h1>
      <div className="px-2">
        <TransactionForm
          categories={categories}
          topCategoryIds={topCategoryIds}
          currency={household.currency}
        />
      </div>
    </main>
  );
}
