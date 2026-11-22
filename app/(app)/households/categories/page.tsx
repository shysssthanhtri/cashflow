import { ChevronLeftIcon, PlusIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { buttonVariants } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { type Category, listCategories } from "@/server/libs/categories";
import { getActiveHouseholdId } from "@/server/libs/households";

import { CategoryIcon } from "./_components/category-icon";

const TYPES = [
  { type: "expense", label: "Expense" },
  { type: "income", label: "Income" },
] as const;

function CategoryGroup({
  label,
  categories,
}: {
  label: string;
  categories: Category[];
}) {
  const nameOf = (id: string | null) =>
    categories.find((c) => c.id === id)?.name;
  const sorted = [...categories].sort((x, y) =>
    (x.parentId ? `${nameOf(x.parentId)}/${x.name}` : x.name).localeCompare(
      y.parentId ? `${nameOf(y.parentId)}/${y.name}` : y.name
    )
  );
  return (
    <section className="mb-6">
      <h2 className="px-2 pb-2 text-sm font-medium text-muted-foreground">
        {label}
      </h2>
      {sorted.length === 0 ? (
        <p className="px-2 text-sm text-muted-foreground">No categories yet.</p>
      ) : (
        <ul className="flex flex-wrap gap-2 px-2">
          {sorted.map((c) => (
            <li key={c.id}>
              <Link
                href={ROUTES.householdsCategoryEdit(c.id)}
                className="flex items-center gap-1.5 rounded-full py-1 pr-3 pl-2 text-sm"
                style={{ backgroundColor: `${c.color}26`, color: c.color }}
              >
                <CategoryIcon
                  icon={c.icon}
                  color={c.color}
                  className="size-5 bg-transparent [&_svg]:size-3.5"
                />
                <span className="text-foreground">
                  {c.parentId ? `${nameOf(c.parentId)} / ${c.name}` : c.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default async function HouseholdCategoriesPage() {
  const householdId = await getActiveHouseholdId();
  if (!householdId) redirect(ROUTES.households);
  const categories = await listCategories(householdId);

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.householdsSettings}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Household
      </Link>
      <div className="flex items-center justify-between gap-3 px-2 pt-2 pb-4">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Link
          href={ROUTES.householdsCategoriesAdd}
          className={buttonVariants({ size: "sm" })}
        >
          <PlusIcon />
          Add
        </Link>
      </div>
      {TYPES.map(({ type, label }) => (
        <CategoryGroup
          key={type}
          label={label}
          categories={categories.filter((c) => c.type === type)}
        />
      ))}
    </main>
  );
}
