import { PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Suspense } from "react";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { getActiveHouseholdId } from "@/server/libs/households";

import { MonthSelector } from "../transactions/_components/month-selector";
import { currentMonth, parseMonth } from "../transactions/_lib/month";
import { BudgetContent } from "./_components/budget-content";
import { BudgetSkeleton } from "./_components/budget-skeleton";

export default async function BudgetPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>;
}) {
  const month = parseMonth((await searchParams).month);
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);

  return (
    <main className="mx-auto max-w-md p-4 pb-8">
      <div className="flex items-center justify-between gap-3 px-2 pt-4 pb-4">
        <h1 className="text-3xl font-bold">Budget</h1>
        <Link
          href={`${ROUTES.budgetAdd}?month=${month}`}
          className={buttonVariants({ size: "sm" })}
        >
          <PlusIcon />
          Add
        </Link>
      </div>
      <MonthSelector
        month={month}
        currentMonth={currentMonth()}
        basePath={ROUTES.budget}
      >
        <Suspense key={month} fallback={<BudgetSkeleton />}>
          <BudgetContent householdId={householdId} month={month} />
        </Suspense>
      </MonthSelector>
    </main>
  );
}
