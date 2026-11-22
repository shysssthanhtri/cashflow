"use client";

import { LogOutIcon } from "lucide-react";
import { useState, useTransition } from "react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

import { leaveHousehold } from "../_actions/leave-household";

export function LeaveHouseholdButton({
  canLeave,
  name,
}: {
  canLeave: boolean;
  name: string;
}) {
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger
          disabled={!canLeave}
          className="flex w-full items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-destructive ring-1 ring-foreground/5 disabled:opacity-50"
        >
          Leave household
          <LogOutIcon className="size-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Leave {name}?</AlertDialogTitle>
            <AlertDialogDescription>
              You will lose access to this household until you rejoin with an
              invite code.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await leaveHousehold();
                  setError(result.error);
                })
              }
            >
              {pending ? "Leaving…" : "Leave"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {!canLeave && (
        <p className="px-2 pt-2 text-xs text-muted-foreground">
          You are the only owner. Make another member an owner before leaving.
        </p>
      )}
      {error && <p className="px-2 pt-2 text-xs text-destructive">{error}</p>}
    </div>
  );
}
