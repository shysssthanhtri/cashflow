import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { HouseholdSwitcher } from "@/components/household-switcher";
import { getHouseholds, resolveActiveHousehold } from "@/lib/household";
import { createClient } from "@/lib/supabase/server";

async function AuthGate({ children }: { children: React.ReactNode }) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) redirect("/welcome");

  const households = await getHouseholds(supabase, user.id);
  const active = await resolveActiveHousehold(households);
  if (!active) redirect("/households/new");

  return (
    <>
      <header className="flex items-center justify-between gap-3 px-6 pt-4">
        {households.length >= 2 ? (
          <HouseholdSwitcher households={households} activeId={active.id} />
        ) : (
          <span className="font-semibold">{active.name}</span>
        )}
        <Link href="/members" className="text-sm underline">
          Members
        </Link>
      </header>
      {children}
    </>
  );
}

export default function TabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-1 flex-col">
      <Suspense
        fallback={
          <div
            aria-busy="true"
            className="mx-auto mt-24 h-8 w-48 animate-pulse rounded-lg bg-muted"
          />
        }
      >
        <AuthGate>{children}</AuthGate>
      </Suspense>
    </div>
  );
}
