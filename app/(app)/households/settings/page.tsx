import {
  ArrowLeftRightIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { getActiveHousehold } from "@/server/libs/households";

import { CopyField } from "./_components/copy-field";
import { LeaveHouseholdButton } from "./_components/leave-household-button";

export default async function HouseholdSettingsPage() {
  const household = await getActiveHousehold();
  if (!household) redirect(ROUTES.households);

  const ownerCount = household.members.filter((m) => m.role === "owner").length;
  const myNickname = household.members.find(
    (m) => m.id === household.currentUserId
  )?.nickname;
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
            <dd>
              <Link
                href={ROUTES.householdsEdit(household.id)}
                className="flex items-center gap-1 font-medium text-primary underline-offset-4 hover:underline"
              >
                {household.name}
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </Link>
            </dd>
          </div>
          <div className="flex justify-between border-b border-border/60 px-4 py-3">
            <dt className="text-muted-foreground">Currency</dt>
            <dd className="text-muted-foreground">{household.currency}</dd>
          </div>
          {household.inviteCode && (
            <div className="flex items-center justify-between gap-3 border-b border-border/60 px-4 py-2">
              <dt className="text-muted-foreground">Invite code</dt>
              <dd>
                <CopyField value={household.inviteCode} />
              </dd>
            </div>
          )}
          <div className="flex justify-between px-4 py-3">
            <dt className="text-muted-foreground">Nickname</dt>
            <dd>
              <Link
                href={ROUTES.householdsEdit(household.id)}
                className={`flex items-center gap-1 underline-offset-4 hover:underline ${myNickname ? "font-medium text-primary" : "text-muted-foreground"}`}
              >
                {myNickname ?? "Not set"}
                <ChevronRightIcon className="size-4 text-muted-foreground" />
              </Link>
            </dd>
          </div>
        </dl>
        <nav className="overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/5">
          <Link
            href={ROUTES.householdsMembers}
            className="flex items-center justify-between border-b border-border/60 px-4 py-3"
          >
            Members ({household.members.length})
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Link>
          <Link
            href={ROUTES.householdsCategories}
            className="flex items-center justify-between px-4 py-3"
          >
            Categories
            <ChevronRightIcon className="size-4 text-muted-foreground" />
          </Link>
        </nav>
        <Link
          href={ROUTES.households}
          className="flex items-center justify-between rounded-xl bg-muted/50 px-4 py-3 ring-1 ring-foreground/5"
        >
          Switch household
          <ArrowLeftRightIcon className="size-4 text-muted-foreground" />
        </Link>
        <LeaveHouseholdButton canLeave={canLeave} name={household.name} />
      </div>
    </main>
  );
}
