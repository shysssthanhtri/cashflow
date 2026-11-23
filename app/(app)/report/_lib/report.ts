import type { Category } from "@/server/libs/categories";
import type { Transaction } from "@/server/libs/transactions";

export type Totals = { income: number; expense: number; net: number };

export function totals(transactions: Transaction[]): Totals {
  let income = 0;
  let expense = 0;
  for (const t of transactions) {
    if (t.type === "income") income += t.amount;
    else expense += t.amount;
  }
  return { income, expense, net: income - expense };
}

export type CategoryShare = {
  id: string | null;
  name: string;
  color: string;
  amount: number;
  share: number;
};

// Sub-categories roll up into their parent; uncategorized goes in one bucket.
export function byCategory(
  transactions: Transaction[],
  categories: Category[],
  type: "income" | "expense"
): CategoryShare[] {
  const byId = new Map(categories.map((c) => [c.id, c]));
  const sums = new Map<string | null, number>();
  let total = 0;
  for (const t of transactions) {
    if (t.type !== type) continue;
    const category = t.categoryId ? byId.get(t.categoryId) : undefined;
    const key = category ? (category.parentId ?? category.id) : null;
    sums.set(key, (sums.get(key) ?? 0) + t.amount);
    total += t.amount;
  }
  return [...sums.entries()]
    .map(([id, amount]) => {
      const category = id ? byId.get(id) : undefined;
      return {
        id,
        name: category?.name ?? "Uncategorized",
        color: category?.color ?? "#a1a1aa",
        amount,
        share: total ? amount / total : 0,
      };
    })
    .sort((a, b) =>
      a.id === null || b.id === null
        ? Number(a.id === null) - Number(b.id === null)
        : b.amount - a.amount
    );
}
