import { redirect } from "next/navigation";
import { connection } from "next/server";
import { Suspense } from "react";

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

  return children;
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
