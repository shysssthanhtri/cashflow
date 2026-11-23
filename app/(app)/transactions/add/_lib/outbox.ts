import type { TransactionValues } from "../_schemas/transaction";

export type OutboxItem = {
  clientId: string;
  values: TransactionValues;
  // Set when the server rejected the item permanently.
  error?: string;
};

const KEY = "cashflow:tx-outbox";

export function readOutbox(): OutboxItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeOutbox(items: OutboxItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(items));
  } catch {
    // Storage full or unavailable; items stay in memory only.
  }
}

export const OUTBOX_KEY = KEY;
