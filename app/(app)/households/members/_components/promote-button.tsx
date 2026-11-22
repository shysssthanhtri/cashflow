"use client";

import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";

import { promoteMember } from "../_actions/promote-member";

export function PromoteButton({ userId }: { userId: string }) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div className="flex flex-col items-end gap-1">
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={pending}
        onClick={() =>
          startTransition(async () => {
            setError((await promoteMember(userId)).error);
          })
        }
      >
        {pending ? "Saving…" : "Make owner"}
      </Button>
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}
