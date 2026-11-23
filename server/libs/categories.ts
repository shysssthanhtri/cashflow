import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense" | "saving";
  parentId: string | null;
  icon: string;
  color: string;
};

export async function listCategories(householdId: string): Promise<Category[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("categories")
    .select("id, name, type, parent_id, icon, color")
    .eq("household_id", householdId)
    .is("archived_at", null)
    .order("name");
  return (data ?? []).map((c) => ({
    id: c.id,
    name: c.name,
    type: c.type,
    parentId: c.parent_id,
    icon: c.icon,
    color: c.color,
  }));
}

export async function listTopCategoryIds(
  householdId: string,
  limit = 5
): Promise<string[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("category_id")
    .eq("household_id", householdId)
    .not("category_id", "is", null);
  const counts = new Map<string, number>();
  for (const row of data ?? []) {
    if (row.category_id)
      counts.set(row.category_id, (counts.get(row.category_id) ?? 0) + 1);
  }
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}
