import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { meetingId, transcript, summary, actionItems, status, duration } = body;

  if (!meetingId) {
    return NextResponse.json({ error: "meetingId is required" }, { status: 400 });
  }

  const transcription = await db.transcription.upsert({
    where: { meetingId },
    update: {
      transcript: transcript || null,
      summary: summary || null,
      actionItems: actionItems || null,
      status: status || "processing",
      duration: duration || null,
    },
    create: {
      meetingId,
      transcript: transcript || null,
      summary: summary || null,
      actionItems: actionItems || null,
      status: status || "processing",
      duration: duration || null,
    },
  });

  return NextResponse.json(transcription, { status: 201 });
}

export async function GET(request: NextRequest) {
  const meetingId = request.nextUrl.searchParams.get("meetingId");

  if (meetingId) {
    const transcription = await db.transcription.findUnique({
      where: { meetingId },
    });
    return NextResponse.json(transcription);
  }

  const transcriptions = await db.transcription.findMany({
    include: { meeting: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(transcriptions);
}
