"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  addTransactions,
  type BatchResult,
} from "../_actions/add-transactions";
import type { TransactionValues } from "../_schemas/transaction";
import { OUTBOX_KEY, type OutboxItem, readOutbox, writeOutbox } from "./outbox";

const DEBOUNCE_MS = 1500;
const MAX_WAIT_MS = 10_000;
const MAX_BACKOFF_MS = 30_000;
const LOCK_NAME = "cashflow:tx-outbox-flush";

export function useOutbox() {
  const [items, setItems] = useState<OutboxItem[]>([]);
  const [syncing, setSyncing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxWaitRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const attemptsRef = useRef(0);
  const mountedRef = useRef(true);
  const flushRef = useRef<() => Promise<void>>(async () => {});

  const refresh = useCallback(() => setItems(readOutbox()), []);

  const clearTimers = useCallback(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (maxWaitRef.current) clearTimeout(maxWaitRef.current);
    debounceRef.current = null;
    maxWaitRef.current = null;
  }, []);

  const flush = useCallback(async () => {
    clearTimers();
    const run = async () => {
      const batch = readOutbox().filter((i) => !i.error);
      if (batch.length === 0) return;
      setSyncing(true);
      let results: BatchResult[] | null = null;
      try {
        results = await addTransactions(
          batch.map(({ clientId, values }) => ({ clientId, values }))
        );
      } catch {
        results = null;
      }
      // Re-read so items added while the request was in flight are kept.
      const byId = new Map(results?.map((r) => [r.clientId, r]));
      const next = readOutbox().flatMap((item) => {
        const r = byId.get(item.clientId);
        if (!r || r.status === "retry") return [item];
        if (r.status === "ok") return [];
        return [{ ...item, error: r.error ?? "Could not add transaction." }];
      });
      writeOutbox(next);
      setItems(next);
      setSyncing(false);

      const needsRetry = !results || results.some((r) => r.status === "retry");
      if (needsRetry && mountedRef.current) {
        attemptsRef.current += 1;
        const delay = Math.min(
          MAX_BACKOFF_MS,
          2000 * 2 ** (attemptsRef.current - 1)
        );
        debounceRef.current = setTimeout(() => flushRef.current(), delay);
      } else {
        attemptsRef.current = 0;
      }
    };
    // Only one tab flushes at a time.
    if (navigator.locks) {
      await navigator.locks.request(LOCK_NAME, run);
    } else {
      await run();
    }
  }, [clearTimers]);

  useEffect(() => {
    flushRef.current = flush;
  }, [flush]);

  const enqueue = useCallback((values: TransactionValues) => {
    const next = [...readOutbox(), { clientId: crypto.randomUUID(), values }];
    writeOutbox(next);
    setItems(next);
    attemptsRef.current = 0;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => flushRef.current(), DEBOUNCE_MS);
    if (!maxWaitRef.current) {
      maxWaitRef.current = setTimeout(() => flushRef.current(), MAX_WAIT_MS);
    }
  }, []);

  const discard = useCallback((clientId: string) => {
    const next = readOutbox().filter((i) => i.clientId !== clientId);
    writeOutbox(next);
    setItems(next);
  }, []);

  useEffect(() => {
    mountedRef.current = true;
    // Recover items left over from a previous session, then sync them.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    void flushRef.current();

    const onHidden = () => {
      if (document.visibilityState === "hidden") void flushRef.current();
    };
    const onOnline = () => void flushRef.current();
    const onPageHide = () => void flushRef.current();
    const onStorage = (e: StorageEvent) => {
      if (e.key === OUTBOX_KEY) refresh();
    };
    document.addEventListener("visibilitychange", onHidden);
    window.addEventListener("online", onOnline);
    window.addEventListener("pagehide", onPageHide);
    window.addEventListener("storage", onStorage);
    return () => {
      document.removeEventListener("visibilitychange", onHidden);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("pagehide", onPageHide);
      window.removeEventListener("storage", onStorage);
      // Push whatever is still queued when leaving the page.
      mountedRef.current = false;
      void flushRef.current();
    };
  }, [refresh]);

  return {
    pendingCount: items.filter((i) => !i.error).length,
    failed: items.filter((i) => i.error),
    syncing,
    enqueue,
    discard,
    flush,
  };
}
