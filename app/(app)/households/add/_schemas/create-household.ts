import * as z from "zod";

export const CURRENCIES = ["VND", "USD"] as const;

export const createHouseholdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(60, "Name must be at most 60 characters."),
  currency: z.enum(CURRENCIES),
});

export type CreateHouseholdValues = z.infer<typeof createHouseholdSchema>;
