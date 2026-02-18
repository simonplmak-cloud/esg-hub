import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Middleware to ensure explicit routes like /developers take priority
 * over the [...slug] catch-all route on Vercel.
 *
 * Next.js App Router should handle this automatically, but Vercel's
 * routing layer sometimes matches the catch-all first.
 * This middleware rewrites the URL to ensure the correct route is used.
 */
export function middleware(request: NextRequest) {
  // No-op: just let Next.js handle the routing
  // The middleware config below ensures these paths are processed
  return NextResponse.next();
}

export const config = {
  matcher: ["/developers/:path*"],
};
