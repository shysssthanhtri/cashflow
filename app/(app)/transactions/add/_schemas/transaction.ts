import * as z from "zod";

import { parseAmount } from "../_lib/parse-amount";

export const NO_CATEGORY = "none";

export const transactionSchema = z.object({
  note: z.string().trim().max(200, "noteTooLong"),
  amount: z.string().refine((v) => parseAmount(v) !== null, "invalidAmount"),
  type: z.enum(["expense", "income", "saving"]),
  categoryId: z.string(),
  occurredAt: z.iso.date("dateRequired"),
});

export type TransactionValues = z.infer<typeof transactionSchema>;

// Returns an error message when the date is in the future.
export function validateOccurredAt(occurredAt: string, today: string) {
  if (occurredAt > today) return "dateFuture";
  return null;
}
