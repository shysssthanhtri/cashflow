import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";

import { ROUTES } from "@/config/routes";

export default function HouseholdCategoriesPage() {
  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.householdsSettings}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Household
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">Categories</h1>
      <p className="px-2 text-muted-foreground">Coming soon.</p>
    </main>
  );
}
