import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export const ACTIVE_HOUSEHOLD_COOKIE = "active_household_id";

export type HouseholdSummary = {
  id: string;
  name: string;
  currency: string;
};

export async function listHouseholds(): Promise<HouseholdSummary[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("households")
    .select("id, name, currency")
    .order("created_at");
  return data ?? [];
}

export async function setActiveHousehold(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_HOUSEHOLD_COOKIE, id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function getActiveHouseholdId(): Promise<string | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(ACTIVE_HOUSEHOLD_COOKIE)?.value;
  if (!id) return null;
  const households = await listHouseholds();
  return households.some((h) => h.id === id) ? id : null;
}
