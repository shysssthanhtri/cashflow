import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { listCategories } from "@/server/libs/categories";
import { getActiveHouseholdId } from "@/server/libs/households";

import { CategoryForm } from "../_components/category-form";
import { addCategory } from "./_actions/add-category";

export default async function AddCategoryPage() {
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);
  const categories = await listCategories(householdId);
  const parents = categories.filter((c) => !c.parentId);

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.householdsCategories}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Categories
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">Add category</h1>
      <div className="px-2">
        <CategoryForm
          parents={parents}
          submitLabel="Add category"
          action={addCategory}
        />
      </div>
    </main>
  );
}
