"use client";

import { CheckIcon } from "lucide-react";
import { useLocale } from "next-intl";
import { useTransition } from "react";

import { LOCALE_LABELS, LOCALES } from "@/i18n/config";

import { setLocale } from "../_actions/set-locale";

export function LanguageSwitcher() {
  const current = useLocale();
  const [pending, startTransition] = useTransition();

  return (
    <ul
      role="radiogroup"
      className="overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/5"
    >
      {LOCALES.map((locale) => {
        const selected = current === locale;
        return (
          <li key={locale} className="border-border/60 not-last:border-b">
            <button
              type="button"
              role="radio"
              aria-checked={selected}
              disabled={pending}
              onClick={() => startTransition(() => setLocale(locale))}
              className="flex w-full items-center gap-3 px-4 py-3 text-left active:bg-foreground/10"
            >
              <span className="flex-1">{LOCALE_LABELS[locale]}</span>
              {selected && <CheckIcon className="size-4" />}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
