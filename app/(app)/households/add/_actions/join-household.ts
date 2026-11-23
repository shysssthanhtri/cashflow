"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { setActiveHousehold } from "@/server/libs/households";

import {
  joinHouseholdSchema,
  type JoinHouseholdValues,
} from "../_schemas/join-household";

export async function joinHousehold(
  values: JoinHouseholdValues
): Promise<{ error: string }> {
  const parsed = joinHouseholdSchema.safeParse(values);
  if (!parsed.success) return { error: "invalidInviteCode" };

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("join_household", {
    p_invite_code: parsed.data.inviteCode,
  });
  if (error || !data) {
    console.error("[joinHousehold] rpc failed", {
      code: error?.code,
      message: error?.message,
    });
    return {
      error: error?.code === "P0002" ? "inviteNotFound" : "joinHouseholdFailed",
    };
  }

  await setActiveHousehold(data);
  redirect(ROUTES.transactionsAdd);
}
