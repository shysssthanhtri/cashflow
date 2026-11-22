import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { getActiveHousehold } from "@/server/libs/households";

import { EditHouseholdForm } from "./_components/edit-household-form";

export default async function EditHouseholdPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const household = await getActiveHousehold();
  if (!household) redirect(ROUTES.households);
  if (household.id !== id) notFound();

  const myNickname =
    household.members.find((m) => m.id === household.currentUserId)?.nickname ??
    "";

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.householdsSettings}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Household
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">Edit household</h1>
      <div className="px-2">
        <EditHouseholdForm
          id={household.id}
          name={household.name}
          nickname={myNickname}
        />
      </div>
    </main>
  );
}
