import { Skeleton } from "@/components/ui/skeleton";

export default function HouseholdsLoading() {
  return (
    <main className="mx-auto flex min-h-svh max-w-md flex-col gap-4 p-6">
      <Skeleton className="h-7 w-48" />
      <ul className="flex flex-col gap-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <li key={i}>
            <Skeleton className="h-14 rounded-lg" />
          </li>
        ))}
      </ul>
      <Skeleton className="h-5 w-40" />
    </main>
  );
}
