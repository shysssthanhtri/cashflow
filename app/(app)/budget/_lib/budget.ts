import type { Budget } from "@/server/libs/budgets";
import type { Category } from "@/server/libs/categories";
import type { Transaction } from "@/server/libs/transactions";

export type BudgetProgress = {
  budget: Budget;
  name: string;
  icon: string | null;
  color: string;
  spent: number;
  ratio: number;
  over: boolean;
  saving: boolean;
};

// Sub-category spending counts toward its parent's budget.
export function budgetProgress(
  budgets: Budget[],
  categories: Category[],
  transactions: Transaction[]
): { overall: BudgetProgress | null; categories: BudgetProgress[] } {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const spentBy = new Map<string, number>();
  let totalSpent = 0;
  for (const t of transactions) {
    if (t.type === "income") continue;
    if (t.type === "expense") totalSpent += t.amount;
    const category = t.categoryId ? byId.get(t.categoryId) : undefined;
    if (!category) continue;
    const key = category.parentId ?? category.id;
    spentBy.set(key, (spentBy.get(key) ?? 0) + t.amount);
  }

  const progress = (
    budget: Budget,
    spent: number,
    meta: Pick<BudgetProgress, "name" | "icon" | "color" | "saving">
  ): BudgetProgress => ({
    budget,
    ...meta,
    spent,
    ratio: Math.min(spent / budget.amount, 1),
    over: spent > budget.amount,
  });

  const overallBudget = budgets.find((b) => b.categoryId === null);
  const rows: BudgetProgress[] = [];
  for (const b of budgets) {
    const category = b.categoryId ? byId.get(b.categoryId) : undefined;
    if (!category) continue;
    rows.push(
      progress(b, spentBy.get(category.id) ?? 0, {
        name: category.name,
        icon: category.icon,
        color: category.color,
        saving: category.type === "saving",
      })
    );
  }
  rows.sort((a, b) => b.spent / b.budget.amount - a.spent / a.budget.amount);

  return {
    overall: overallBudget
      ? progress(overallBudget, totalSpent, {
          name: "Overall",
          icon: null,
          color: "#a1a1aa",
          saving: false,
        })
      : null,
    categories: rows,
  };
}
