import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Skip Clerk auth entirely if keys aren't available in Edge Runtime
// Auth will be handled by server components via @clerk/nextjs/server auth()

export async function middleware(request: NextRequest) {
  // Allow all routes to pass through
  // Server components will handle auth via @clerk/nextjs/server
  return NextResponse.next();
}

export const config = {
  matcher: [
    // Skip all paths that should not be processed by middleware
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};