"use server";

import { revalidatePath } from "next/cache";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";

export async function promoteMember(
  userId: string
): Promise<{ error?: string }> {
  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "noActiveHousehold" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("promote_member", {
    p_household_id: householdId,
    p_user_id: userId,
  });
  if (error) {
    console.error("[promoteMember] rpc failed", {
      code: error.code,
      message: error.message,
    });
    return { error: "promoteFailed" };
  }

  revalidatePath(ROUTES.householdsMembers);
  return {};
}
