import { createClient } from "@/lib/supabase/server";

export type Period = {
  id: string;
  startDate: string;
};

export async function getOpenPeriod(
  householdId: string
): Promise<Period | null> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("periods")
    .select("id, start_date")
    .eq("household_id", householdId)
    .eq("status", "open")
    .maybeSingle();
  return data ? { id: data.id, startDate: data.start_date } : null;
}
