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

export type PeriodSummary = Period & {
  endDate: string | null;
  status: "open" | "closed";
};

export async function listPeriods(
  householdId: string
): Promise<PeriodSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("periods")
    .select("id, start_date, end_date, status")
    .eq("household_id", householdId)
    .order("start_date", { ascending: false });
  return (data ?? []).map((p) => ({
    id: p.id,
    startDate: p.start_date,
    endDate: p.end_date,
    status: p.status,
  }));
}
