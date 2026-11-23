import { Skeleton } from "@/components/ui/skeleton";

export default function LanguageLoading() {
  return (
    <main className="mx-auto max-w-md p-4">
      <div className="px-2 pt-4">
        <Skeleton className="h-5 w-20" />
      </div>
      <div className="px-2 pt-2 pb-4">
        <Skeleton className="h-9 w-40" />
      </div>
      <Skeleton className="h-[98px] rounded-xl" />
    </main>
  );
}
