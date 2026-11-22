"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";
import { getOpenPeriod } from "@/server/libs/periods";

import { parseAmount } from "../_lib/parse-amount";
import {
  NO_CATEGORY,
  transactionSchema,
  type TransactionValues,
  validateOccurredAt,
} from "../_schemas/transaction";

// Latest calendar date on Earth (UTC+14), so users in any timezone can pick "today".
function latestToday() {
  return new Date(Date.now() + 14 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function addTransaction(
  values: TransactionValues
): Promise<{ error?: string }> {
  const parsed = transactionSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid transaction details." };
  const { note, type, categoryId, occurredAt } = parsed.data;
  const amount = parseAmount(parsed.data.amount);
  if (amount === null) return { error: "Enter a valid amount." };

  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "No active household." };

  const period = await getOpenPeriod(householdId);
  if (!period) return { error: "There is no open period." };

  const dateError = validateOccurredAt(
    occurredAt,
    period.startDate,
    latestToday()
  );
  if (dateError) return { error: dateError };

  const supabase = await createClient();

  if (categoryId !== NO_CATEGORY) {
    const { data: category } = await supabase
      .from("categories")
      .select("id")
      .eq("id", categoryId)
      .eq("household_id", householdId)
      .eq("type", type)
      .is("archived_at", null)
      .maybeSingle();
    if (!category) return { error: "Invalid category." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await supabase.from("transactions").insert({
    household_id: householdId,
    period_id: period.id,
    category_id: categoryId === NO_CATEGORY ? null : categoryId,
    type,
    amount,
    note: note || null,
    occurred_at: occurredAt,
    created_by: user?.id ?? null,
  });
  if (error) {
    console.error("[addTransaction] insert failed", {
      code: error.code,
      message: error.message,
    });
    return { error: "Could not add transaction." };
  }

  revalidatePath(ROUTES.periods, "layout");
  return {};
}
