import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const meeting = await db.meeting.findUnique({
    where: { id },
    include: {
      organizer: true,
      project: true,
      attendees: {
        include: {
          user: true,
          stakeholder: true,
        },
      },
      transcription: true,
    },
  });

  if (!meeting) {
    return NextResponse.json({ error: "Meeting not found" }, { status: 404 });
  }

  return NextResponse.json(meeting);
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const { title, description, startTime, endTime, location, meetingUrl, meetingType, status } = body;

  const meeting = await db.meeting.update({
    where: { id },
    data: {
      title,
      description: description || null,
      startTime: startTime ? new Date(startTime) : undefined,
      endTime: endTime ? new Date(endTime) : undefined,
      location: location || null,
      meetingUrl: meetingUrl || null,
      meetingType: meetingType || null,
      status,
    },
  });

  return NextResponse.json(meeting);
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await db.meeting.delete({
    where: { id },
  });

  return NextResponse.json({ success: true });
}
