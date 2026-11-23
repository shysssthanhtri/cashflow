import * as z from "zod";

export const joinHouseholdSchema = z.object({
  inviteCode: z.string().trim().min(1, "inviteCodeRequired"),
});

export type JoinHouseholdValues = z.infer<typeof joinHouseholdSchema>;
