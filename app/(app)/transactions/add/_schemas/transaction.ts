import * as z from "zod";

import { parseAmount } from "../_lib/parse-amount";

export const NO_CATEGORY = "none";

export const transactionSchema = z.object({
  note: z.string().trim().max(200, "Note is too long."),
  amount: z
    .string()
    .refine((v) => parseAmount(v) !== null, "Enter a valid amount."),
  type: z.enum(["expense", "income"]),
  categoryId: z.string(),
  occurredAt: z.iso.date("Date is required."),
});

export type TransactionValues = z.infer<typeof transactionSchema>;

// Returns an error message when the date is in the future.
export function validateOccurredAt(occurredAt: string, today: string) {
  if (occurredAt > today) return "Date can't be in the future.";
  return null;
}
