import * as z from "zod";

export const editHouseholdSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(60, "Name must be at most 60 characters."),
  nickname: z
    .string()
    .trim()
    .max(60, "Nickname must be at most 60 characters."),
});

export type EditHouseholdValues = z.infer<typeof editHouseholdSchema>;
