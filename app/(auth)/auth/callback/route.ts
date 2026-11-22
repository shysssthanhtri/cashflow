import { NextResponse } from "next/server";

import { ROUTES } from "@/config/routes";
import { createClient } from "@/lib/supabase/server";
import { listHouseholds, setActiveHousehold } from "@/server/libs/households";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      const households = await listHouseholds();
      if (households.length === 0) {
        return NextResponse.redirect(`${origin}${ROUTES.householdsAdd}`);
      }
      if (households.length === 1) {
        await setActiveHousehold(households[0].id);
        return NextResponse.redirect(`${origin}${ROUTES.transactionsAdd}`);
      }
      return NextResponse.redirect(`${origin}${ROUTES.households}`);
    }
  }

  return NextResponse.redirect(`${origin}${ROUTES.login}`);
}
