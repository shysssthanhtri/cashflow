"use server";

import { redirect } from "next/navigation";

import { createClient } from "@/lib/supabase/server";

export type NameState = { message?: string };

export async function saveDisplayName(
  _prev: NameState,
  formData: FormData,
): Promise<NameState> {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) return { message: "Enter your name." };
  if (name.length > 60) return { message: "Keep it under 60 characters." };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { error } = await supabase
    .from("profiles")
    .upsert({ user_id: user.id, display_name: name });
  if (error) return { message: "Couldn't save your name. Try again." };

  redirect("/add");
}
