"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { getActiveHouseholdId } from "@/server/libs/households";
import { getOpenPeriod } from "@/server/libs/periods";

import {
  periodSchema,
  type PeriodValues,
  validateStartDate,
} from "../_schemas/period";

// Latest calendar date on Earth (UTC+14), so users in any timezone can pick "today".
function latestToday() {
  return new Date(Date.now() + 14 * 3600 * 1000).toISOString().slice(0, 10);
}

export async function addPeriod(
  values: PeriodValues
): Promise<{ error: string }> {
  const parsed = periodSchema.safeParse(values);
  if (!parsed.success) return { error: "Invalid start date." };
  const { startDate } = parsed.data;

  const dateError = validateStartDate(startDate, latestToday());
  if (dateError) return { error: dateError };

  const householdId = await getActiveHouseholdId();
  if (!householdId) return { error: "No active household." };

  if (await getOpenPeriod(householdId))
    return { error: "There is already an open period." };

  const supabase = await createClient();
  const { data: overlapping } = await supabase
    .from("periods")
    .select("id")
    .eq("household_id", householdId)
    .lte("start_date", startDate)
    .or(`end_date.is.null,end_date.gte.${startDate}`)
    .limit(1);
  if (overlapping?.length)
    return { error: "Start date falls within another period." };

  const { error } = await supabase.from("periods").insert({
    household_id: householdId,
    start_date: startDate,
    status: "open",
  });
  if (error) {
    console.error("[addPeriod] insert failed", {
      code: error.code,
      message: error.message,
    });
    return {
      error:
        error.code === "23P01" || error.code === "23505"
          ? "This period conflicts with an existing period."
          : "Could not add period.",
    };
  }

  revalidatePath(ROUTES.transactionsAdd);
  redirect(ROUTES.transactionsAdd);
}
