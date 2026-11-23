import { Skeleton } from "@/components/ui/skeleton";

import { BudgetSkeleton } from "./_components/budget-skeleton";

export default function BudgetLoading() {
  return (
    <main className="mx-auto max-w-md p-4">
      <Skeleton className="mx-2 mt-4 mb-4 h-9 w-40" />
      <Skeleton className="mx-auto mb-4 h-8 w-28" />
      <Skeleton className="mb-4 h-7 w-full" />
      <BudgetSkeleton />
    </main>
  );
}
