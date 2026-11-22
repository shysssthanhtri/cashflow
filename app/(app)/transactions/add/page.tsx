import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { listCategories, listTopCategoryIds } from "@/server/libs/categories";
import {
  getActiveHousehold,
  getActiveHouseholdId,
} from "@/server/libs/households";
import { getOpenPeriod } from "@/server/libs/periods";

import { TransactionForm } from "./_components/transaction-form";

export default async function AddPage() {
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);
  const period = await getOpenPeriod(householdId);
  if (!period) redirect(ROUTES.periodsAdd);
  const household = await getActiveHousehold();
  const [categories, topCategoryIds] = await Promise.all([
    listCategories(householdId),
    listTopCategoryIds(householdId),
  ]);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="px-2 pt-6 pb-4 text-3xl font-bold">Add transaction</h1>
      <div className="px-2">
        <TransactionForm
          categories={categories}
          topCategoryIds={topCategoryIds}
          periodStart={period.startDate}
          currency={household?.currency ?? "VND"}
        />
      </div>
    </main>
  );
}
