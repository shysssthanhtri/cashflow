import { ArrowLeftRightIcon, ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { getActiveHousehold } from "@/server/libs/households";

import { CopyField } from "./_components/copy-field";
import { LeaveHouseholdButton } from "./_components/leave-household-button";
import { PromoteButton } from "./_components/promote-button";

export default async function HouseholdSettingsPage() {
  const household = await getActiveHousehold();
  if (!household) redirect(ROUTES.households);

  const ownerCount = household.members.filter((m) => m.role === "owner").length;
  const canLeave = !household.isOwner || ownerCount > 1;

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.other}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Settings
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">Household</h1>
      <div className="flex flex-col gap-6">
        <dl className="overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/5">
          <div className="flex justify-between border-b border-border/60 px-4 py-3">
            <dt className="text-muted-foreground">Name</dt>
            <dd>{household.name}</dd>
          </div>
          <div
            className={`flex justify-between px-4 py-3 ${household.inviteCode ? "border-b border-border/60" : ""}`}
          >
            <dt className="text-muted-foreground">Currency</dt>
            <dd>{household.currency}</dd>
          </div>
          {household.inviteCode && (
            <div className="flex items-center justify-between gap-3 px-4 py-2">
              <dt className="text-muted-foreground">Invite code</dt>
              <dd>
                <CopyField value={household.inviteCode} />
              </dd>
            </div>
          )}
        </dl>
        <Link
          href={ROUTES.households}
          className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 ring-1 ring-foreground/5"
        >
          Switch household
          <ArrowLeftRightIcon className="size-4 text-muted-foreground" />
        </Link>
        <LeaveHouseholdButton canLeave={canLeave} name={household.name} />
        <section>
          <h2 className="px-2 pb-2 text-sm font-medium text-muted-foreground">
            Members ({household.members.length})
          </h2>
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
                        You
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
                    {m.role}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    </main>
  );
}
