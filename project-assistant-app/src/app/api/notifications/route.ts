import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const userId = request.nextUrl.searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "userId is required" }, { status: 400 });
  }

  const notifications = await db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return NextResponse.json(notifications);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { userId, type, title, message, data } = body;

  if (!userId || !type || !title || !message) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const notification = await db.notification.create({
    data: {
      userId,
      type,
      title,
      message,
      data: data || null,
    },
  });

  return NextResponse.json(notification, { status: 201 });
}
