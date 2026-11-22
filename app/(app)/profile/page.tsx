import { ChevronLeftIcon } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const { data: claims } = await supabase.auth.getClaims();
  const userId = claims?.claims?.sub;
  if (!userId) redirect(ROUTES.login);

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email")
    .eq("id", userId)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-md p-4">
      <Link
        href={ROUTES.other}
        className="flex items-center gap-1 px-2 pt-4 text-sm text-muted-foreground"
      >
        <ChevronLeftIcon className="size-4" />
        Settings
      </Link>
      <h1 className="px-2 pt-2 pb-4 text-3xl font-bold">Profile</h1>
      <dl className="overflow-hidden rounded-xl bg-muted/50 ring-1 ring-foreground/5">
        <div className="flex justify-between border-b border-border/60 px-4 py-3">
          <dt className="text-muted-foreground">Name</dt>
          <dd>{profile?.name ?? "—"}</dd>
        </div>
        <div className="flex justify-between px-4 py-3">
          <dt className="text-muted-foreground">Email</dt>
          <dd>{profile?.email ?? "—"}</dd>
        </div>
      </dl>
    </main>
  );
}
