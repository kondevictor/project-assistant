import { NextResponse } from "next/server";
import { getAuthUrl } from "@/lib/google";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get("projectId");
  const redirectTo = searchParams.get("redirectTo") || "/meetings";

  const state = JSON.stringify({ projectId, redirectTo });
  const authUrl = getAuthUrl(state);

  return NextResponse.redirect(authUrl);
}