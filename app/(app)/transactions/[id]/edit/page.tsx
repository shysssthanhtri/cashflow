import { notFound, redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { listCategories, listTopCategoryIds } from "@/server/libs/categories";
import { getActiveHouseholdSummary } from "@/server/libs/households";
import { getTransaction } from "@/server/libs/transactions";

import { TransactionForm } from "../../add/_components/transaction-form";
import { NO_CATEGORY } from "../../add/_schemas/transaction";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("transactions");
  const household = await getActiveHouseholdSummary();
  if (!household) redirect(ROUTES.households);
  const [transaction, categories, topCategoryIds] = await Promise.all([
    getTransaction(household.id, id),
    listCategories(household.id),
    listTopCategoryIds(household.id),
  ]);
  if (!transaction) notFound();

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">{t("editTitle")}</h1>
      <div className="px-2">
        <TransactionForm
          categories={categories}
          topCategoryIds={topCategoryIds}
          currency={household.currency}
          editing={{
            id: transaction.id,
            claimed: !!transaction.claimedAt,
            values: {
              note: transaction.note ?? "",
              amount: String(transaction.amount),
              type: transaction.type,
              categoryId: transaction.categoryId ?? NO_CATEGORY,
              occurredAt: transaction.occurredAt,
              prepaid: transaction.prepaid,
            },
          }}
        />
      </div>
    </main>
  );
}
