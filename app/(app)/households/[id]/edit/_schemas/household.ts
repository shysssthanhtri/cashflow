import * as z from "zod";

export const editHouseholdSchema = z.object({
  name: z.string().trim().min(1, "nameRequired").max(60, "nameMax60"),
  nickname: z.string().trim().max(60, "nicknameMax60"),
});

export type EditHouseholdValues = z.infer<typeof editHouseholdSchema>;
