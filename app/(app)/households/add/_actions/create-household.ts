"use server";

import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { setActiveHousehold } from "@/server/libs/households";

import {
  createHouseholdSchema,
  type CreateHouseholdValues,
} from "../_schemas/create-household";

export async function createHousehold(
  values: CreateHouseholdValues
): Promise<{ error: string }> {
  const parsed = createHouseholdSchema.safeParse(values);
  if (!parsed.success) {
    console.error("[createHousehold] invalid input", parsed.error.flatten());
    return { error: "invalidHousehold" };
  }

  const supabase = await createClient();
  const { data, error } = await supabase.rpc("create_household", {
    p_name: parsed.data.name,
    p_currency: parsed.data.currency,
  });
  if (error || !data) {
    console.error("[createHousehold] rpc failed", {
      code: error?.code,
      message: error?.message,
      details: error?.details,
      hint: error?.hint,
    });
    return { error: "createHouseholdFailed" };
  }

  await setActiveHousehold(data);
  redirect(ROUTES.transactionsAdd);
}
