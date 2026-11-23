import * as z from "zod";

import { parseAmount } from "../../transactions/add/_lib/parse-amount";

export const OVERALL = "overall";

export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Choose a category."),
  amount: z
    .string()
    .refine((v) => parseAmount(v) !== null, "Enter a valid amount."),
  recurring: z.boolean(),
});

export type BudgetValues = z.infer<typeof budgetSchema>;
