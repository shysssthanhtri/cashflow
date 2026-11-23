"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";

import { parseAmount } from "../add/_lib/parse-amount";
import {
  NO_CATEGORY,
  transactionSchema,
  type TransactionValues,
  validateOccurredAt,
} from "../add/_schemas/transaction";

export async function updateTransaction(
  id: string,
  values: TransactionValues,
  claimed: boolean
): Promise<{ error?: string }> {
  const parsed = z
    .object({ id: z.uuid(), values: transactionSchema })
    .safeParse({ id, values });
  if (!parsed.success) return { error: "invalidTransaction" };
  const v = parsed.data.values;

  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "noActiveHousehold" };

  const amount = parseAmount(v.amount);
  if (amount === null) return { error: "invalidAmount" };
  // Latest calendar date on Earth (UTC+14), so users in any timezone can pick "today".
  const today = new Date(Date.now() + 14 * 3600 * 1000)
    .toISOString()
    .slice(0, 10);
  const dateError = validateOccurredAt(v.occurredAt, today);
  if (dateError) return { error: dateError };

  const supabase = await createClient();
  if (v.categoryId !== NO_CATEGORY) {
    const { data: category } = await supabase
      .from("categories")
      .select("type")
      .eq("id", v.categoryId)
      .eq("household_id", householdId)
      .is("archived_at", null)
      .maybeSingle();
    if (!category || category.type !== v.type)
      return { error: "invalidCategoryShort" };
  }

  const prepaid = v.type === "expense" && !!v.prepaid;
  const { data: existing } = await supabase
    .from("transactions")
    .select("claimed_at")
    .eq("id", id)
    .eq("household_id", householdId)
    .maybeSingle();
  if (!existing) return { error: "invalidTransaction" };
  const claimedAt =
    prepaid && claimed
      ? (existing.claimed_at ?? new Date().toISOString())
      : null;
  const { data, error } = await supabase
    .from("transactions")
    .update({
      category_id: v.categoryId === NO_CATEGORY ? null : v.categoryId,
      type: v.type,
      amount,
      note: v.note || null,
      occurred_at: v.occurredAt,
      prepaid,
      claimed_at: claimedAt,
    })
    .eq("id", id)
    .eq("household_id", householdId)
    .select("id");
  if (error || !data?.length) return { error: "invalidTransaction" };
  revalidatePath(ROUTES.transactions, "layout");
  return {};
}
