import { redirect } from "next/navigation";
import { Suspense } from "react";

import { ROUTES } from "@/config/routes";
import { getActiveHouseholdId } from "@/server/libs/households";

import { currentMonth } from "../transactions/_lib/month";
import { ReportContent } from "./_components/report-content";
import { ReportSkeleton } from "./_components/report-skeleton";

export default async function ReportPage() {
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);

  return (
    <main className="mx-auto max-w-md p-4 pb-8 md:max-w-2xl">
      <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">Report</h1>
      <Suspense fallback={<ReportSkeleton />}>
        <ReportContent householdId={householdId} month={currentMonth()} />
      </Suspense>
    </main>
  );
}
