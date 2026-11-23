import { createClient } from "@/lib/supabase/server";

export type Budget = {
  id: string;
  // null = overall monthly cap
  categoryId: string | null;
  amount: number;
  recurring: boolean;
};

// Lists a month's budgets ("YYYY-MM"). For the current month or earlier it
// first carries over last month's recurring budgets (idempotent).
export async function listBudgets(
  householdId: string,
  month: string,
  currentMonth: string
): Promise<Budget[]> {
  const supabase = await createClient();
  if (month <= currentMonth) {
    await supabase.rpc("ensure_month_budgets", {
      p_household_id: householdId,
      p_month: `${month}-01`,
    });
  }
  const { data } = await supabase
    .from("budgets")
    .select("id, category_id, amount, recurring")
    .eq("household_id", householdId)
    .eq("month", `${month}-01`);
  return (data ?? []).map((b) => ({
    id: b.id,
    categoryId: b.category_id,
    amount: b.amount,
    recurring: b.recurring,
  }));
}

export async function getBudget(householdId: string, id: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("budgets")
    .select("id, category_id, month, amount, recurring")
    .eq("household_id", householdId)
    .eq("id", id)
    .maybeSingle();
  return data;
}
