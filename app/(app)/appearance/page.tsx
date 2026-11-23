import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { ThemeSwitcher } from "@/components/theme-switcher";
import { ROUTES } from "@/config/routes";

export default async function AppearancePage() {
  const t = await getTranslations("appearance");
  const tc = await getTranslations("common");
  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.other}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        {tc("settings")}
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">{t("title")}</h1>
      <ThemeSwitcher />
    </main>
  );
}
