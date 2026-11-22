"use client";

import { Button } from "@/components/ui/button";
import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/client";

export function GoogleSignInButton() {
  async function signIn() {
    await createClient().auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}${ROUTES.authCallback}`,
      },
    });
  }

  return <Button onClick={signIn}>Continue with Google</Button>;
}
