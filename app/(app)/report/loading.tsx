import { Skeleton } from "@/components/ui/skeleton";

export default function ReportLoading() {
  return (
    <main className="mx-auto max-w-md p-4">
      <Skeleton className="mx-2 mt-4 mb-4 h-9 w-40" />
      <div className="flex flex-col gap-4">
        <Skeleton className="h-20 rounded-xl" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    </main>
  );
}
