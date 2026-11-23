import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";

import { ROUTES } from "@/config/routes";
import { getActiveHousehold } from "@/server/libs/households";

import { PromoteButton } from "./_components/promote-button";

export default async function HouseholdMembersPage() {
  const t = await getTranslations("households");
  const household = await getActiveHousehold();
  if (!household) redirect(ROUTES.households);

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.householdsSettings}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        {t("title")}
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">
        {t("members", { count: household.members.length })}
      </h1>
      <ul className="overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/5">
        {household.members.map((m) => (
          <li
            key={m.id}
            className="flex items-center justify-between gap-3 px-4 py-3 not-last:border-b not-last:border-border/60"
          >
            <div className="min-w-0">
              <p className="flex items-center gap-2">
                <span className="truncate">{m.name}</span>
                {m.id === household.currentUserId && (
                  <span className="shrink-0 rounded-full bg-primary px-1.5 text-[10px] leading-4 text-primary-foreground">
                    {t("you")}
                  </span>
                )}
              </p>
              <p className="truncate text-sm text-muted-foreground">
                {m.email}
              </p>
            </div>
            {household.isOwner && m.role === "member" ? (
              <PromoteButton userId={m.id} />
            ) : (
              <span className="text-sm text-muted-foreground capitalize">
                {t(`roles.${m.role}`)}
              </span>
            )}
          </li>
        ))}
      </ul>
    </main>
  );
}
