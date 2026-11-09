"use server";

import { headers } from "next/headers";

import { createClient } from "@/lib/supabase/server";

export type LoginState = {
  status: "idle" | "sent" | "error";
  message?: string;
};

export async function sendMagicLink(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return { status: "error", message: "Enter a valid email address." };
  }

  const h = await headers();
  const origin = h.get("origin") ?? `https://${h.get("host")}`;

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: `${origin}/auth/callback` },
  });

  if (error) {
    return { status: "error", message: "Couldn't send the link. Try again." };
  }
  return { status: "sent", message: `Check ${email} for your sign-in link.` };
}
