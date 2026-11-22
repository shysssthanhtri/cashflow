"use client";

import { Loader2Icon } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function HouseholdOption({
  href,
  name,
  currency,
}: {
  href: string;
  name: string;
  currency: string;
}) {
  const [pending, setPending] = useState(false);

  return (
    <Link
      href={href}
      prefetch={false}
      onClick={(e) => {
        if (pending) e.preventDefault();
        else setPending(true);
      }}
      aria-busy={pending}
      className={cn(
        "flex h-14 items-center justify-between rounded-lg border px-4 transition hover:bg-muted active:scale-[0.98]",
        pending && "pointer-events-none border-primary bg-muted opacity-70"
      )}
    >
      <span>{name}</span>
      {pending ? (
        <Loader2Icon className="size-4 animate-spin text-muted-foreground" />
      ) : (
        <span className="text-sm text-muted-foreground">{currency}</span>
      )}
    </Link>
  );
}
