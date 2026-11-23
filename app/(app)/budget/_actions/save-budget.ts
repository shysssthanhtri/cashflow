"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";

import { parseMonth } from "../../transactions/_lib/month";
import { parseAmount } from "../../transactions/add/_lib/parse-amount";
import { budgetSchema, type BudgetValues, OVERALL } from "../_schemas/budget";

export async function saveBudget(
  month: string,
  values: BudgetValues
): Promise<{ error: string }> {
  const parsed = budgetSchema.safeParse(values);
  const amount = parsed.success ? parseAmount(parsed.data.amount) : null;
  if (!parsed.success || amount === null) {
    return { error: "Invalid budget details." };
  }

  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "No active household." };

  const supabase = await createClient();
  const { categoryId, recurring } = parsed.data;
  const category = categoryId === OVERALL ? null : categoryId;
  const validMonth = parseMonth(month);

  if (category) {
    // Budgets live on top-level expense categories; sub-categories roll up.
    const { data } = await supabase
      .from("categories")
      .select("id")
      .eq("id", category)
      .eq("household_id", householdId)
      .eq("type", "expense")
      .is("parent_id", null)
      .is("archived_at", null)
      .maybeSingle();
    if (!data) return { error: "Invalid category." };
  }

  const query = supabase
    .from("budgets")
    .select("id")
    .eq("household_id", householdId)
    .eq("month", `${validMonth}-01`);
  const { data: existing } = await (
    category === null
      ? query.is("category_id", null)
      : query.eq("category_id", category)
  ).maybeSingle();

  const { error } = existing
    ? await supabase
        .from("budgets")
        .update({ amount, recurring })
        .eq("id", existing.id)
    : await supabase.from("budgets").insert({
        household_id: householdId,
        category_id: category,
        month: `${validMonth}-01`,
        amount,
        recurring,
      });
  if (error) {
    console.error("[saveBudget] failed", {
      code: error.code,
      message: error.message,
    });
    return { error: "Could not save budget." };
  }

  revalidatePath(ROUTES.budget);
  redirect(`${ROUTES.budget}?month=${validMonth}`);
}

export async function deleteBudget(
  id: string,
  month: string
): Promise<{ error: string }> {
  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "No active household." };

  const supabase = await createClient();
  const { error } = await supabase
    .from("budgets")
    .delete()
    .eq("id", id)
    .eq("household_id", householdId);
  if (error) {
    console.error("[deleteBudget] failed", {
      code: error.code,
      message: error.message,
    });
    return { error: "Could not remove budget." };
  }

  revalidatePath(ROUTES.budget);
  redirect(`${ROUTES.budget}?month=${parseMonth(month)}`);
}
