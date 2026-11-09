import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

import { createClient } from "@/lib/supabase/server";

import { LoginForm } from "./login-form";

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  await connection();
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (user) redirect("/add");

  const { error } = await searchParams;

  return (
    <>
      {error && (
        <p role="alert" className="text-destructive">
          That link didn&apos;t work. Request a new one.
        </p>
      )}
      <LoginForm />
    </>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <main className="mx-auto flex w-full max-w-[480px] flex-1 flex-col justify-center gap-6 p-6">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <Suspense
        fallback={<div className="h-40 animate-pulse rounded-lg bg-muted" />}
      >
        <LoginContent searchParams={searchParams} />
      </Suspense>
    </main>
  );
}
