"use client";

import { useTranslations } from "next-intl";
import { useTransition } from "react";

import { Button } from "@/components/ui/button";

import { setClaimed } from "../_actions/set-claimed";

export function ClaimButton({ id }: { id: string }) {
  const t = useTranslations("transactions");
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="outline"
      size="xs"
      disabled={pending}
      onClick={() => startTransition(() => void setClaimed(id, true))}
    >
      {t("markClaimed")}
    </Button>
  );
}
