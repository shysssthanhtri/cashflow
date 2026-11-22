import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { getActiveHouseholdId } from "@/server/libs/households";

export default async function AddPage() {
  if (!(await getActiveHouseholdId())) redirect(ROUTES.households);

  return (
    <main className="p-6">
      <h1 className="text-lg font-medium">Add</h1>
    </main>
  );
}
