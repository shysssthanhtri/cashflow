import { createClient } from "@/lib/supabase/server";

export type Category = {
  id: string;
  name: string;
  type: "income" | "expense";
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
