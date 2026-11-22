import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { listCategories } from "@/server/libs/categories";
import { getActiveHouseholdId } from "@/server/libs/households";

import { CategoryForm } from "../../_components/category-form";
import { NO_PARENT } from "../../_schemas/category";
import { editCategory } from "./_actions/edit-category";

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);
  const categories = await listCategories(householdId);
  const category = categories.find((c) => c.id === id);
  if (!category) notFound();

  const hasChildren = categories.some((c) => c.parentId === id);
  const parents = hasChildren
    ? []
    : categories.filter((c) => !c.parentId && c.id !== id);

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.householdsCategories}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Categories
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">Edit category</h1>
      <div className="px-2">
        <CategoryForm
          parents={parents}
          submitLabel="Save changes"
          action={editCategory.bind(null, id)}
          defaultValues={{
            name: category.name,
            type: category.type,
            parentId: category.parentId ?? NO_PARENT,
            icon: category.icon,
            color: category.color as never,
          }}
        />
      </div>
    </main>
  );
}
