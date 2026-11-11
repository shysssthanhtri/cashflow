"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { getHouseholds, setActiveHouseholdCookie } from "@/lib/household";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type FormState = { message?: string; ok?: boolean };

export async function createHousehold(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { message: "Enter a household name." };
  if (name.length > 60) return { message: "Keep it under 60 characters." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: household, error } = await supabase
    .from("households")
    .insert({ name, created_by: user.id })
    .select("id")
    .single();
  if (error || !household)
    return { message: "Couldn't create the household. Try again." };

  const { error: memberError } = await supabase
    .from("household_members")
    .insert({ household_id: household.id, user_id: user.id, role: "owner" });
  if (memberError) {
    await supabase.from("households").delete().eq("id", household.id);
    return { message: "Couldn't create the household. Try again." };
  }

  await setActiveHouseholdCookie(household.id);
  redirect("/add");
}

export async function switchHousehold(formData: FormData) {
  const id = String(formData.get("household_id") ?? "");
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const households = await getHouseholds(supabase, user.id);
  if (!households.some((h) => h.id === id)) return;

  await setActiveHouseholdCookie(id);
  revalidatePath("/", "layout");
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function inviteMember(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = String(formData.get("email") ?? "").trim();
  const householdId = String(formData.get("household_id") ?? "");
  if (!EMAIL_RE.test(email)) return { message: "Enter a valid email." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  // Caller must belong to the household; RLS only returns rows for members.
  const { data: membership } = await supabase
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!membership) return { message: "You can't invite to this household." };

  const admin = createAdminClient();
  const { data: invitedId, error: lookupError } = await admin.rpc(
    "find_user_id_by_email",
    { p_email: email },
  );
  if (lookupError) return { message: "Couldn't send the invite. Try again." };
  if (!invitedId) return { message: "Ask them to sign in once first." };

  const { data: existing } = await admin
    .from("household_members")
    .select("user_id")
    .eq("household_id", householdId)
    .eq("user_id", invitedId)
    .maybeSingle();
  if (existing) return { message: "Already a member." };

  const { error } = await admin
    .from("household_members")
    .insert({ household_id: householdId, user_id: invitedId, role: "member" });
  if (error) return { message: "Couldn't send the invite. Try again." };

  revalidatePath("/members");
  return { ok: true, message: "Added to the household." };
}
