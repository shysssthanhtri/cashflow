"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import {
  clearActiveHousehold,
  getActiveHouseholdId,
} from "@/server/libs/households";

export async function leaveHousehold(): Promise<{ error: string }> {
  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "noActiveHousehold" };

  const supabase = await createClient();
  const { error } = await supabase.rpc("leave_household", {
    p_household_id: householdId,
  });
  if (error) {
    console.error("[leaveHousehold] rpc failed", {
      code: error.code,
      message: error.message,
    });
    return {
      error: error.code === "P0001" ? "leaveNeedsOwner" : "leaveFailed",
    };
  }

  await clearActiveHousehold();
  redirect(ROUTES.households);
}
