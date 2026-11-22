import type { NextRequest } from "next/server";
import { NextResponse, userAgent } from "next/server";

import { ROUTES } from "@/config/routes";
import { updateSession } from "@/lib/supabase/proxy";

export async function proxy(request: NextRequest) {
  const { device } = userAgent(request);
  if (request.nextUrl.pathname === ROUTES.home && device.type === "mobile") {
    return NextResponse.redirect(new URL(ROUTES.add, request.url));
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|manifest.webmanifest|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
