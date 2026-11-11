import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

import { CreateHouseholdForm } from "./create-form";

async function Content() {
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

  return <CreateHouseholdForm />;
}

export default function NewHouseholdPage() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Create your household</h1>
      <p className="text-muted-foreground">
        Everyone in a household shares the same entries.
      </p>
      <Suspense
        fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}
      >
        <Content />
      </Suspense>
    </main>
  );
}
