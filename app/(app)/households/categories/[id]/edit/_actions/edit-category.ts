"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";

import {
  categorySchema,
  type CategoryValues,
  NO_PARENT,
} from "../../../_schemas/category";

export async function editCategory(
  id: string,
  values: CategoryValues
): Promise<{ error: string }> {
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    console.error("[editCategory] invalid input", parsed.error.flatten());
    return { error: "Invalid category details." };
  }

  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "No active household." };

  const supabase = await createClient();
  const { name, type, parentId, icon, color } = parsed.data;

  if (parentId !== NO_PARENT) {
    if (parentId === id) return { error: "Invalid parent category." };
    const { data: parent } = await supabase
      .from("categories")
      .select("id")
      .eq("id", parentId)
      .eq("household_id", householdId)
      .eq("type", type)
      .is("parent_id", null)
      .is("archived_at", null)
      .maybeSingle();
    if (!parent) return { error: "Invalid parent category." };

    // Only one level of nesting: a category that has children can't get a parent
    const { count } = await supabase
      .from("categories")
      .select("id", { count: "exact", head: true })
      .eq("parent_id", id);
    if (count)
      return { error: "A category with sub-categories can't be nested." };
  }

  const { data, error } = await supabase
    .from("categories")
    .update({
      name,
      type,
      icon,
      color,
      parent_id: parentId === NO_PARENT ? null : parentId,
    })
    .eq("id", id)
    .eq("household_id", householdId)
    .select("id");
  if (error || !data?.length) {
    console.error("[editCategory] update failed", {
      code: error?.code,
      message: error?.message,
    });
    return {
      error:
        error?.code === "23505"
          ? "A category with this name already exists."
          : "Could not update category.",
    };
  }

  revalidatePath(ROUTES.householdsCategories);
  redirect(ROUTES.householdsCategories);
}
