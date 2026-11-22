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

export async function clearActiveHousehold() {
  const cookieStore = await cookies();
  cookieStore.delete(ACTIVE_HOUSEHOLD_COOKIE);
}

export async function getActiveHouseholdId(): Promise<string | null> {
  const cookieStore = await cookies();
  const id = cookieStore.get(ACTIVE_HOUSEHOLD_COOKIE)?.value;
  if (!id) return null;
  const households = await listHouseholds();
  return households.some((h) => h.id === id) ? id : null;
}

export type HouseholdMember = {
  id: string;
  name: string;
  email: string;
  role: "owner" | "member";
  joinedAt: string;
};

export type HouseholdDetail = HouseholdSummary & {
  inviteCode: string | null;
  currentUserId: string | null;
  isOwner: boolean;
  members: HouseholdMember[];
};

export async function getActiveHousehold(): Promise<HouseholdDetail | null> {
  const id = await getActiveHouseholdId();
  if (!id) return null;
  const supabase = await createClient();
  const { data: household } = await supabase
    .from("households")
    .select("id, name, currency, invite_code")
    .eq("id", id)
    .single();
  if (!household) return null;
  const { data: memberships } = await supabase
    .from("memberships")
    .select("role, joined_at, profiles(id, name, email)")
    .eq("household_id", id)
    .order("joined_at");
  const members = (memberships ?? []).flatMap((m) => {
    const profile = Array.isArray(m.profiles) ? m.profiles[0] : m.profiles;
    return profile
      ? [
          {
            id: profile.id,
            name: profile.name,
            email: profile.email,
            role: m.role,
            joinedAt: m.joined_at,
          },
        ]
      : [];
  });
  const { data: claims } = await supabase.auth.getClaims();
  const currentUserId = claims?.claims?.sub ?? null;
  const isOwner = members.some(
    (m) => m.id === currentUserId && m.role === "owner"
  );
  const { invite_code, ...summary } = household;
  return {
    ...summary,
    inviteCode: invite_code,
    currentUserId,
    isOwner,
    members,
  };
}
