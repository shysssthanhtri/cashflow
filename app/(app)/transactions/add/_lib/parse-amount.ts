const SUFFIX: Record<string, number> = { k: 1e3, m: 1e6, b: 1e9 };

// Parses "14k", "1.5m", "1,200", "12.50" into a number. Returns null if invalid.
export function parseAmount(input: string): number | null {
  const m = input
    .trim()
    .toLowerCase()
    .match(/^(\d[\d,]*(?:\.\d+)?)\s*([kmb])?$/);
  if (!m) return null;
  const n = Number(m[1].replace(/,/g, "")) * (m[2] ? SUFFIX[m[2]] : 1);
  return Number.isFinite(n) && n > 0 ? Math.round(n * 100) / 100 : null;
}

// Finds the last amount-like token in a note ("lunch 14k" -> "14k").
export function extractAmount(note: string): string | null {
  const matches = note.match(
    /(?<![\w.,])\d[\d,]*(?:\.\d+)?\s?[kmb]?(?![\w])/gi
  );
  if (!matches) return null;
  for (const token of matches.reverse()) {
    const value = token.replace(/\s/g, "");
    if (parseAmount(value) !== null) return value;
  }
  return null;
}
