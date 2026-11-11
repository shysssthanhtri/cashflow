import "server-only";

import type { SupabaseClient } from "@supabase/supabase-js";
import { cookies } from "next/headers";

export const ACTIVE_HOUSEHOLD_COOKIE = "active_household";

export type Household = { id: string; name: string };

export async function getHouseholds(
  supabase: SupabaseClient,
  userId: string,
): Promise<Household[]> {
  const { data } = await supabase
    .from("household_members")
    .select("joined_at, households(id, name)")
    .eq("user_id", userId)
    .order("joined_at", { ascending: false });

  return (data ?? []).flatMap((row) => {
    const h = row.households as unknown as Household | null;
    return h ? [{ id: h.id, name: h.name }] : [];
  });
}

// Cookie value if it is one of the user's households, else the most recently joined.
// Cookies can't be written during render, so the cookie is persisted by the
// create/switch actions; this fallback covers every other case.
export async function resolveActiveHousehold(
  households: Household[],
): Promise<Household | null> {
  if (households.length === 0) return null;
  const cookieStore = await cookies();
  const id = cookieStore.get(ACTIVE_HOUSEHOLD_COOKIE)?.value;
  return households.find((h) => h.id === id) ?? households[0];
}

export async function setActiveHouseholdCookie(id: string) {
  const cookieStore = await cookies();
  cookieStore.set(ACTIVE_HOUSEHOLD_COOKIE, id, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}
