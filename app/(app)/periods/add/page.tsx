import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { getActiveHouseholdId } from "@/server/libs/households";
import { getOpenPeriod } from "@/server/libs/periods";

import { PeriodForm } from "./_components/period-form";

export default async function AddPeriodPage() {
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);
  if (await getOpenPeriod(householdId)) redirect(ROUTES.transactionsAdd);

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="px-2 pt-4 pb-2 text-3xl font-bold">Start a period</h1>
      <p className="px-2 pb-4 text-sm text-muted-foreground">
        Create an open period before adding transactions.
      </p>
      <div className="px-2">
        <PeriodForm />
      </div>
    </main>
  );
}
