import { Skeleton } from "@/components/ui/skeleton";

export default function HouseholdCategoriesLoading() {
  return (
    <main className="mx-auto max-w-md p-4">
      <Skeleton className="mx-2 mt-4 h-5 w-20" />
      <div className="flex items-center justify-between px-2 pt-3 pb-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-8 w-16" />
      </div>
      <Skeleton className="mb-6 h-36 rounded-xl" />
      <Skeleton className="h-36 rounded-xl" />
    </main>
  );
}
