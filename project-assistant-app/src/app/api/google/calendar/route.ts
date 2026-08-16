import { NextRequest, NextResponse } from "next/server";
import { createCalendarEvent, getCalendarEvents } from "@/lib/google";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { accessToken, title, description, startTime, endTime, attendees, location } = body;

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 });
    }

    const event = await createCalendarEvent(accessToken, {
      summary: title || "Event",
      description,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      attendees: attendees?.map((email: string) => ({ email })),
      location,
    });

    return NextResponse.json({
      eventId: event.id,
      eventLink: event.htmlLink,
      meetLink: event.conferenceData?.entryPoints?.[0]?.uri,
    });
  } catch (error: unknown) {
    console.error("Calendar event creation error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to create event";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const accessToken = searchParams.get("accessToken");
    const timeMin = searchParams.get("timeMin");
    const timeMax = searchParams.get("timeMax");

    if (!accessToken) {
      return NextResponse.json({ error: "Access token required" }, { status: 401 });
    }

    const events = await getCalendarEvents(
      accessToken,
      timeMin ? new Date(timeMin) : new Date(),
      timeMax ? new Date(timeMax) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
    );

    return NextResponse.json({ events });
  } catch (error: unknown) {
    console.error("Calendar events fetch error:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to fetch events";
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}