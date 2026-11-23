"use client";

import { useTranslations } from "next-intl";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { useErrorMessage } from "@/i18n/use-error-message";

import { promoteMember } from "../_actions/promote-member";

export function PromoteButton({ userId }: { userId: string }) {
  const t = useTranslations("households");
  const errorMessage = useErrorMessage();
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
        {pending ? t("saving") : t("makeOwner")}
      </Button>
      {error && (
        <p className="text-xs text-destructive">{errorMessage(error)}</p>
      )}
    </div>
  );
}
