"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";

import { parseAmount } from "../_lib/parse-amount";
import {
  NO_CATEGORY,
  transactionSchema,
  type TransactionValues,
  validateOccurredAt,
} from "../_schemas/transaction";

export type PendingTransaction = {
  clientId: string;
  values: TransactionValues;
};

// ok: saved (or already saved). retry: transient failure, keep queued.
// error: permanent, the user must review it.
export type BatchResult = {
  clientId: string;
  status: "ok" | "retry" | "error";
  error?: string;
};

const batchSchema = z.array(
  z.object({ clientId: z.uuid(), values: transactionSchema })
);

// Latest calendar date on Earth (UTC+14), so users in any timezone can pick "today".
function latestToday() {
  return new Date(Date.now() + 14 * 3600 * 1000).toISOString().slice(0, 10);
}

function failAll(batch: PendingTransaction[], error: string): BatchResult[] {
  return batch.map((b) => ({ clientId: b.clientId, status: "error", error }));
}

export async function addTransactions(
  batch: PendingTransaction[]
): Promise<BatchResult[]> {
  const parsed = batchSchema.safeParse(batch);
  if (!parsed.success) return failAll(batch, "invalidTransaction");

  const householdId = await getActiveHouseholdId();
  if (!householdId) return failAll(batch, "noActiveHousehold");

  const supabase = await createClient();
  const [
    {
      data: { user },
    },
    { data: categories },
  ] = await Promise.all([
    supabase.auth.getUser(),
    supabase
      .from("categories")
      .select("id, type")
      .eq("household_id", householdId)
      .is("archived_at", null),
  ]);
  if (!categories) {
    return batch.map((b) => ({ clientId: b.clientId, status: "retry" }));
  }
  const categoryTypes = new Map(categories.map((c) => [c.id, c.type]));

  const results: BatchResult[] = [];
  const rows = [];
  const today = latestToday();
  for (const { clientId, values } of parsed.data) {
    const amount = parseAmount(values.amount);
    let error: string | null = null;
    if (amount === null) error = "invalidAmount";
    else error = validateOccurredAt(values.occurredAt, today);
    if (
      !error &&
      values.categoryId !== NO_CATEGORY &&
      categoryTypes.get(values.categoryId) !== values.type
    ) {
      error = "invalidCategoryShort";
    }
    if (error || amount === null) {
      results.push({ clientId, status: "error", error: error ?? undefined });
      continue;
    }
    rows.push({
      client_id: clientId,
      household_id: householdId,
      category_id: values.categoryId === NO_CATEGORY ? null : values.categoryId,
      type: values.type,
      amount,
      note: values.note || null,
      occurred_at: values.occurredAt,
      created_by: user?.id ?? null,
    });
  }

  if (rows.length > 0) {
    const { error } = await supabase.from("transactions").upsert(rows, {
      onConflict: "household_id,client_id",
      ignoreDuplicates: true,
    });
    if (error) {
      console.error("[addTransactions] insert failed", {
        code: error.code,
        message: error.message,
      });
    }
    for (const r of rows) {
      results.push({ clientId: r.client_id, status: error ? "retry" : "ok" });
    }
    if (!error) revalidatePath(ROUTES.transactions, "layout");
  }

  return results;
}
