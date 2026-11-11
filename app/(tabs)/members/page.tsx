import { connection } from "next/server";
import { Suspense } from "react";

import { getHouseholds, resolveActiveHousehold } from "@/lib/household";
import { createClient } from "@/lib/supabase/server";

import { InviteForm } from "./invite-form";

async function Content() {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const households = await getHouseholds(supabase, user!.id);
  const active = await resolveActiveHousehold(households);
  if (!active) return null;

  const { data: members, error } = await supabase
    .from("household_members")
    .select("user_id, role, joined_at")
    .eq("household_id", active.id)
    .order("joined_at", { ascending: true })
    .limit(100);

  const ids = (members ?? []).map((m) => m.user_id);
  const { data: profiles } = await supabase
    .from("profiles")
    .select("user_id, display_name")
    .in("user_id", ids);
  const names = new Map(
    (profiles ?? []).map((p) => [p.user_id, p.display_name]),
  );

  return (
    <>
      <section className="flex flex-col gap-3">
        <h2 className="text-lg font-semibold">{active.name}</h2>
        {error ? (
          <p role="alert" className="text-destructive">
            Couldn&apos;t load members. Refresh to retry.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {(members ?? []).map((m) => (
              <li
                key={m.user_id}
                className="flex min-h-12 items-center justify-between rounded-lg bg-muted px-3"
              >
                <span>{names.get(m.user_id) ?? "Member"}</span>
                <span className="text-sm text-muted-foreground capitalize">
                  {m.role}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
      <InviteForm householdId={active.id} />
    </>
  );
}

export default function MembersPage() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-col gap-6 p-6">
      <h1 className="text-2xl font-semibold">Members</h1>
      <Suspense
        fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}
      >
        <Content />
      </Suspense>
    </main>
  );
}
