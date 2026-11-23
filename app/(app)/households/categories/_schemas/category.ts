import * as z from "zod";

import { CATEGORY_COLORS, CATEGORY_ICON_NAMES } from "../_lib/category-style";

export const CATEGORY_TYPES = ["expense", "income", "saving"] as const;
export const NO_PARENT = "none";

export const categorySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Name is required.")
    .max(60, "Name must be at most 60 characters."),
  type: z.enum(CATEGORY_TYPES),
  parentId: z.string(),
  icon: z.enum(CATEGORY_ICON_NAMES as [string, ...string[]]),
  color: z.enum(CATEGORY_COLORS),
});

export type CategoryValues = z.infer<typeof categorySchema>;
