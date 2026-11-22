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
} from "../../_schemas/category";

export async function addCategory(
  values: CategoryValues
): Promise<{ error: string }> {
  const parsed = categorySchema.safeParse(values);
  if (!parsed.success) {
    console.error("[addCategory] invalid input", parsed.error.flatten());
    return { error: "Invalid category details." };
  }

  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "No active household." };

  const supabase = await createClient();
  const { name, type, parentId, icon, color } = parsed.data;

  if (parentId !== NO_PARENT) {
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
  }

  const { error } = await supabase.from("categories").insert({
    household_id: householdId,
    name,
    type,
    icon,
    color,
    parent_id: parentId === NO_PARENT ? null : parentId,
  });
  if (error) {
    console.error("[addCategory] insert failed", {
      code: error.code,
      message: error.message,
    });
    return {
      error:
        error.code === "23505"
          ? "A category with this name already exists."
          : "Could not add category.",
    };
  }

  revalidatePath(ROUTES.householdsCategories);
  redirect(ROUTES.householdsCategories);
}
