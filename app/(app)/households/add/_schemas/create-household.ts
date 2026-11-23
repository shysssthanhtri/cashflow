import * as z from "zod";

export const CURRENCIES = ["VND", "USD"] as const;

export const createHouseholdSchema = z.object({
  name: z.string().trim().min(1, "nameRequired").max(60, "nameMax60"),
  currency: z.enum(CURRENCIES),
});

export type CreateHouseholdValues = z.infer<typeof createHouseholdSchema>;
