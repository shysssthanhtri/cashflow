import * as z from "zod";

export const joinHouseholdSchema = z.object({
  inviteCode: z.string().trim().min(1, "Invite code is required."),
});

export type JoinHouseholdValues = z.infer<typeof joinHouseholdSchema>;
