import {
  ChevronRightIcon,
  HouseIcon,
  LanguagesIcon,
  LogOutIcon,
  PaletteIcon,
  UserIcon,
} from "lucide-react";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { cn } from "@/lib/utils";

const groups = [
  [
    {
      href: ROUTES.profile,
      label: "profile",
      icon: UserIcon,
      color: "bg-blue-500",
    },
    {
      href: ROUTES.householdsSettings,
      label: "household",
      icon: HouseIcon,
      color: "bg-orange-500",
    },
    {
      href: ROUTES.appearance,
      label: "appearance",
      icon: PaletteIcon,
      color: "bg-purple-500",
    },
    {
      href: ROUTES.language,
      label: "language",
      icon: LanguagesIcon,
      color: "bg-green-500",
    },
  ],
  [
    {
      href: ROUTES.logout,
      label: "logout",
      icon: LogOutIcon,
      color: "bg-red-500",
    },
  ],
] as const;

export default async function OtherPage() {
  const t = await getTranslations("settings");
  return (
    <main className="mx-auto max-w-md p-4">
      <h1 className="px-2 pt-4 pb-4 text-3xl font-bold">{t("title")}</h1>
      <div className="flex flex-col gap-6">
        {groups.map((group, i) => (
          <ul
            key={i}
            className="overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/5"
          >
            {group.map(({ href, label, icon: Icon, color }) => (
              <li key={href} className="border-border/60 not-last:border-b">
                {href === ROUTES.logout ? (
                  <form action={href} method="post">
                    <Button
                      type="submit"
                      variant="ghost"
                      className="h-auto w-full justify-start gap-3 px-4 py-3 text-base font-normal active:bg-foreground/10"
                    >
                      <span
                        className={cn(
                          "flex size-7 items-center justify-center rounded-md text-white",
                          color
                        )}
                      >
                        <Icon className="size-4" />
                      </span>
                      <span className="flex-1">{t(label)}</span>
                      <ChevronRightIcon className="size-4 text-muted-foreground" />
                    </Button>
                  </form>
                ) : (
                  <Link
                    href={href}
                    className="flex items-center gap-3 px-4 py-3 active:bg-foreground/10"
                  >
                    <span
                      className={cn(
                        "flex size-7 items-center justify-center rounded-md text-white",
                        color
                      )}
                    >
                      <Icon className="size-4" />
                    </span>
                    <span className="flex-1">{t(label)}</span>
                    <ChevronRightIcon className="size-4 text-muted-foreground" />
                  </Link>
                )}
              </li>
            ))}
          </ul>
        ))}
      </div>
    </main>
  );
}
