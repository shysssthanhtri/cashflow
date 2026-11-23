import { createClient } from "@/lib/supabase/server";

export type Transaction = {
  id: string;
  type: "income" | "expense" | "saving";
  amount: number;
  note: string | null;
  occurredAt: string;
  categoryId: string | null;
  prepaid: boolean;
  claimedAt: string | null;
};

export async function listTransactions(
  householdId: string,
  range: { from: string; to: string }
): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, note, occurred_at, category_id, prepaid, claimed_at"
    )
    .eq("household_id", householdId)
    .gte("occurred_at", range.from)
    .lt("occurred_at", range.to)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    note: t.note,
    occurredAt: t.occurred_at,
    categoryId: t.category_id,
    prepaid: t.prepaid,
    claimedAt: t.claimed_at,
  }));
}

export async function getTransaction(
  householdId: string,
  id: string
): Promise<Transaction | null> {
  const supabase = await createClient();
  const { data: t } = await supabase
    .from("transactions")
    .select(
      "id, type, amount, note, occurred_at, category_id, prepaid, claimed_at"
    )
    .eq("household_id", householdId)
    .eq("id", id)
    .maybeSingle();
  if (!t) return null;
  return {
    id: t.id,
    type: t.type,
    amount: t.amount,
    note: t.note,
    occurredAt: t.occurred_at,
    categoryId: t.category_id,
    prepaid: t.prepaid,
    claimedAt: t.claimed_at,
  };
}
