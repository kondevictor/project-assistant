import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const meetings = await db.meeting.findMany({
    where: { projectId },
    include: {
      organizer: true,
      attendees: {
        include: {
          user: true,
          stakeholder: true,
        },
      },
      transcription: true,
      project: true,
    },
    orderBy: { startTime: "desc" },
  });

  return NextResponse.json(meetings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, organizerId, title, description, startTime, endTime, location, meetingUrl, meetingType } = body;

  if (!projectId || !organizerId || !title || !startTime || !endTime) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const meeting = await db.meeting.create({
    data: {
      projectId,
      organizerId,
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location || null,
      meetingUrl: meetingUrl || null,
      meetingType: meetingType || null,
    },
  });

  return NextResponse.json(meeting, { status: 201 });
}
