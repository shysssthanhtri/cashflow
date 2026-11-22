import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { getActiveHouseholdId } from "@/server/libs/households";
import { getOpenPeriod } from "@/server/libs/periods";

export default async function PeriodsPage() {
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);

  const period = await getOpenPeriod(householdId);
  if (period) redirect(ROUTES.period(period.id));

  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">Periods</h1>
      <div className="px-2">
        <p className="pb-3 text-sm text-muted-foreground">
          There is no open period.
        </p>
        <Link href={ROUTES.periodsAdd} className={buttonVariants()}>
          Start a period
        </Link>
      </div>
    </main>
  );
}
