import { NextRequest, NextResponse } from "next/server";
import { getTokens } from "@/lib/google";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL(`/meetings?error=${error}`, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/meetings?error=no_code", request.url));
  }

  try {
    const tokens = await getTokens(code);

    // Store tokens in database (in production, encrypt them)
    // For now, we'll pass them via URL to the frontend
    let redirectTo = "/meetings";
    let projectId = "";

    if (state) {
      try {
        const parsed = JSON.parse(state);
        redirectTo = parsed.redirectTo || "/meetings";
        projectId = parsed.projectId || "";
      } catch {
        // Invalid state, use defaults
      }
    }

    // Redirect with tokens
    const redirectUrl = new URL(redirectTo, request.url);
    redirectUrl.searchParams.set("access_token", tokens.access_token || "");
    redirectUrl.searchParams.set("refresh_token", tokens.refresh_token || "");
    if (projectId) redirectUrl.searchParams.set("projectId", projectId);

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("Google OAuth error:", error);
    return NextResponse.redirect(new URL("/meetings?error=oauth_failed", request.url));
  }
}