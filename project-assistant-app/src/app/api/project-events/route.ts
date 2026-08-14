import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, type, title, description, userId } = body;

  if (!projectId || !type || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const event = await db.projectEvent.create({
    data: {
      projectId,
      userId: userId || null,
      type,
      title,
      description: description || null,
    },
  });

  return NextResponse.json(event, { status: 201 });
}

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const events = await db.projectEvent.findMany({
    where: { projectId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(events);
}
