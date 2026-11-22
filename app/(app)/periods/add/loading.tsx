import { Skeleton } from "@/components/ui/skeleton";

export default function AddPeriodLoading() {
  return (
    <main className="mx-auto max-w-md p-4">
      <Skeleton className="mx-2 mt-4 mb-2 h-9 w-48" />
      <Skeleton className="mx-2 mb-4 h-4 w-64" />
      <div className="flex flex-col gap-4 px-2">
        <Skeleton className="h-9" />
        <Skeleton className="h-9" />
      </div>
    </main>
  );
}
