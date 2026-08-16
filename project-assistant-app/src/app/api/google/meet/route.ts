import { NextRequest, NextResponse } from "next/server";
import { createMeetLink, createCalendarEvent } from "@/lib/google";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, title, startTime, endTime, description, attendees, projectId } = body;

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 });
    }

    // Create Google Meet link
    const meetLink = await createMeetLink(accessToken);

    // Create calendar event with Meet link
    const event = await createCalendarEvent(accessToken, {
      summary: title || "Meeting",
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendees: attendees?.map((email: string) => ({ email })),
      createMeetLink: true,
    });

    return NextResponse.json({
      meetLink,
      eventId: event.id,
      eventLink: event.htmlLink,
    });
  } catch (error: unknown) {
    console.error("Google Meet creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create meeting";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}