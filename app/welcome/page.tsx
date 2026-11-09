import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

import { NameForm } from "./name-form";

async function WelcomeContent() {
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
  if (profile) redirect("/add");

  return <NameForm />;
}

export default function WelcomePage() {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">What should we call you?</h1>
      <Suspense
        fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}
      >
        <WelcomeContent />
      </Suspense>
    </main>
  );
}
