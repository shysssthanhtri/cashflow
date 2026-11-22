import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { getActiveHouseholdId } from "@/server/libs/households";
import { getOpenPeriod } from "@/server/libs/periods";

export default async function AddPage() {
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);
  if (!(await getOpenPeriod(householdId))) redirect(ROUTES.periodsAdd);

  return (
    <main className="p-6">
      <h1 className="text-lg font-medium">Add</h1>
    </main>
  );
}
