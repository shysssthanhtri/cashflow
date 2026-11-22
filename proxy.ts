import type { NextRequest } from "next/server";
import { NextResponse, userAgent } from "next/server";

import { ROUTES } from "@/config/routes";

export function proxy(request: NextRequest) {
  const { device } = userAgent(request);
  if (device.type === "mobile") {
    return NextResponse.redirect(new URL(ROUTES.add, request.url));
  }
}

export const config = {
  matcher: "/",
};
