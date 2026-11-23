import { createClient } from "@/lib/supabase/server";

export type Transaction = {
  id: string;
  type: "income" | "expense";
  amount: number;
  note: string | null;
  occurredAt: string;
  categoryId: string | null;
};

export async function listTransactions(
  householdId: string
): Promise<Transaction[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("transactions")
    .select("id, type, amount, note, occurred_at, category_id")
    .eq("household_id", householdId)
    .order("occurred_at", { ascending: false })
    .order("created_at", { ascending: false });
  return (data ?? []).map((t) => ({
    id: t.id,
    type: t.type,
    amount: t.amount,
    note: t.note,
    occurredAt: t.occurred_at,
    categoryId: t.category_id,
  }));
}
