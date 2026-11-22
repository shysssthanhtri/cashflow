import { NextResponse } from "next/server";

import { ROUTES } from "@/config/routes";
import { listHouseholds, setActiveHousehold } from "@/server/libs/households";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const id = searchParams.get("id");
  const households = await listHouseholds();

  if (!id || !households.some((h) => h.id === id)) {
    return NextResponse.redirect(`${origin}${ROUTES.households}`);
  }

  await setActiveHousehold(id);
  return NextResponse.redirect(`${origin}${ROUTES.transactionsAdd}`);
}
