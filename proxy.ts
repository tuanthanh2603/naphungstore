import type { NextRequest } from "next/server";
import { handleAuthProxy } from "@/lib/auth/proxy";

export async function proxy(request: NextRequest) {
  return handleAuthProxy(request);
}

export const config = {
  matcher: ["/admin", "/admin/:path*", "/dashboard", "/dashboard/:path*", "/login"],
};
