"use client";

import { Button } from "@/components/ui/button";

import type { OutboxItem } from "../_lib/outbox";

export function SyncStatus({
  pendingCount,
  syncing,
  failed,
  currency,
  onRestore,
  onDiscard,
}: {
  pendingCount: number;
  syncing: boolean;
  failed: OutboxItem[];
  currency: string;
  onRestore: (item: OutboxItem) => void;
  onDiscard: (clientId: string) => void;
}) {
  if (pendingCount === 0 && failed.length === 0) return null;
  return (
    <div className="flex flex-col gap-2 text-sm" aria-live="polite">
      {pendingCount > 0 && (
        <p className="text-muted-foreground">
          {syncing ? "Syncing" : "Saved locally"} · {pendingCount} pending
        </p>
      )}
      {failed.map((item) => (
        <div
          key={item.clientId}
          className="flex items-center justify-between gap-2 rounded-md border border-destructive/50 p-2"
        >
          <div className="min-w-0">
            <p className="truncate">
              {item.values.note || "(no note)"} · {item.values.amount}{" "}
              {currency}
            </p>
            <p className="text-destructive">{item.error}</p>
          </div>
          <div className="flex shrink-0 gap-1">
            <Button
              type="button"
              size="sm"
              variant="outline"
              onClick={() => onRestore(item)}
            >
              Edit
            </Button>
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={() => onDiscard(item.clientId)}
            >
              Discard
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}
