import { Skeleton } from "@/components/ui/skeleton";

export default function HouseholdMembersLoading() {
  return (
    <main className="mx-auto max-w-md p-4">
      <Skeleton className="mx-2 mt-4 h-5 w-20" />
      <Skeleton className="mx-2 mt-3 mb-4 h-9 w-40" />
      <Skeleton className="h-36 rounded-xl" />
    </main>
  );
}
