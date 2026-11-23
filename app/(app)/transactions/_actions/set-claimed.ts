"use server";

import { revalidatePath } from "next/cache";
import * as z from "zod";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";

const inputSchema = z.object({ id: z.uuid(), claimed: z.boolean() });

export async function setClaimed(id: string, claimed: boolean) {
  const parsed = inputSchema.safeParse({ id, claimed });
  if (!parsed.success) return { error: "invalidTransaction" };
  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "noActiveHousehold" };

  const supabase = await createClient();
  const { error } = await supabase
    .from("transactions")
    .update({ claimed_at: claimed ? new Date().toISOString() : null })
    .eq("id", id)
    .eq("household_id", householdId)
    .eq("prepaid", true);
  if (error) return { error: "invalidTransaction" };
  revalidatePath(ROUTES.transactions, "layout");
  return {};
}
