// Finds the category whose name appears in the note (case-insensitive,
// whole-word). The longest matching name wins.
export function matchCategory<T extends { name: string }>(
  note: string,
  categories: T[]
): T | null {
  const text = note.toLowerCase();
  let best: T | null = null;
  for (const c of categories) {
    const name = c.name.trim().toLowerCase();
    if (!name || (best && name.length <= best.name.trim().length)) continue;
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    if (
      new RegExp(`(?<![\\p{L}\\p{N}])${escaped}(?![\\p{L}\\p{N}])`, "u").test(
        text
      )
    )
      best = c;
  }
  return best;
}
