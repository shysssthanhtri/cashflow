import { useTranslations } from "next-intl";

/** Translates an error key returned by a server action (falls back to the raw text). */
export function useErrorMessage() {
  const t = useTranslations("errors");
  return (message?: string) =>
    message && t.has(message as never) ? t(message as never) : message;
}
