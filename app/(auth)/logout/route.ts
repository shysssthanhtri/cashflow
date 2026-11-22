import { NextResponse } from "next/server";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  const supabase = await createClient();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL(ROUTES.login, request.url), 303);
}
