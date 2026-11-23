"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";

import {
  editHouseholdSchema,
  type EditHouseholdValues,
} from "../_schemas/household";

export async function editHousehold(
  id: string,
  values: EditHouseholdValues
): Promise<{ error: string }> {
  const parsed = editHouseholdSchema.safeParse(values);
  if (!parsed.success) {
    console.error("[editHousehold] invalid input", parsed.error.flatten());
    return { error: "invalidHousehold" };
  }

  const householdId = await getActiveHouseholdId();
  if (!householdId || householdId !== id) {
    return { error: "noActiveHousehold" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("households")
    .update({ name: parsed.data.name })
    .eq("id", householdId)
    .select("id");
  if (error || !data?.length) {
    console.error("[editHousehold] update failed", {
      code: error?.code,
      message: error?.message,
    });
    return { error: "updateHouseholdFailed" };
  }

  const { error: nicknameError } = await supabase.rpc("set_nickname", {
    p_household_id: householdId,
    p_nickname: parsed.data.nickname,
  });
  if (nicknameError) {
    console.error("[editHousehold] set_nickname failed", {
      code: nicknameError.code,
      message: nicknameError.message,
    });
    return { error: "updateNicknameFailed" };
  }

  revalidatePath("/", "layout");
  redirect(ROUTES.householdsSettings);
}
