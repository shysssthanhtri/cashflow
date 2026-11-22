import { Skeleton } from "@/components/ui/skeleton";

export default function HouseholdSettingsLoading() {
  return (
    <main className="mx-auto max-w-md p-4">
      <Skeleton className="mx-2 mt-4 h-5 w-20" />
      <Skeleton className="mx-2 mt-3 mb-4 h-9 w-40" />
      <div className="flex flex-col gap-6">
        <Skeleton className="h-24 rounded-xl" />
        <section>
          <Skeleton className="mx-2 mb-2 h-5 w-28" />
          <Skeleton className="h-36 rounded-xl" />
        </section>
      </div>
    </main>
  );
}
