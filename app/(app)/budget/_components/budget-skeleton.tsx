import { Skeleton } from "@/components/ui/skeleton";

export function BudgetSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      <Skeleton className="h-20 rounded-xl" />
      <Skeleton className="h-48 rounded-xl" />
    </div>
  );
}
