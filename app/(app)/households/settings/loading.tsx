import { Skeleton } from "@/components/ui/skeleton";

export default function HouseholdSettingsLoading() {
  return (
    <main className="mx-auto max-w-md p-4">
      <div className="px-2 pt-4">
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="px-2 pt-2 pb-4">
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex flex-col gap-6">
        <Skeleton className="h-[146px] rounded-xl" />
        <Skeleton className="h-[98px] rounded-xl" />
        <Skeleton className="h-[50px] rounded-xl" />
        <Skeleton className="h-9 rounded-lg" />
      </div>
    </main>
  );
}
