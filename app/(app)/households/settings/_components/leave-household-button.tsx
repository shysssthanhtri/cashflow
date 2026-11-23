"use client";

import { LogOutIcon } from "lucide-react";
import { useTranslations } from "next-intl";
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
import { useErrorMessage } from "@/i18n/use-error-message";

import { leaveHousehold } from "../_actions/leave-household";

export function LeaveHouseholdButton({
  canLeave,
  name,
}: {
  canLeave: boolean;
  name: string;
}) {
  const t = useTranslations("households");
  const tc = useTranslations("common");
  const errorMessage = useErrorMessage();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string>();

  return (
    <div>
      <AlertDialog>
        <AlertDialogTrigger
          disabled={!canLeave}
          className="flex w-full items-center justify-between rounded-xl bg-muted/50 px-4 py-3 text-destructive ring-1 ring-foreground/5 disabled:opacity-50"
        >
          {t("leave")}
          <LogOutIcon className="size-4" />
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t("leaveTitle", { name })}</AlertDialogTitle>
            <AlertDialogDescription>
              {t("leaveDescription")}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{tc("cancel")}</AlertDialogCancel>
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
              {pending ? t("leaving") : t("leaveShort")}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      {!canLeave && (
        <p className="px-2 pt-2 text-xs text-muted-foreground">
          {t("onlyOwner")}
        </p>
      )}
      {error && (
        <p className="px-2 pt-2 text-xs text-destructive">
          {errorMessage(error)}
        </p>
      )}
    </div>
  );
}
