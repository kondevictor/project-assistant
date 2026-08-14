"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const MeetingSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  organizerId: z.string().min(1, "Organizer ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  startTime: z.string().datetime(),
  endTime: z.string().datetime(),
  location: z.string().optional(),
  meetingUrl: z.string().url().optional().or(z.literal("")),
  meetingType: z.enum(["google_meet", "zoom", "teams", "in_person"]).optional(),
});

export type MeetingInput = z.infer<typeof MeetingSchema>;

export async function createMeeting(input: MeetingInput) {
  const validated = MeetingSchema.parse(input);
  const meeting = await db.meeting.create({
    data: {
      ...validated,
      startTime: new Date(validated.startTime),
      endTime: new Date(validated.endTime),
      meetingUrl: validated.meetingUrl || null,
    },
  });
  revalidatePath(`/projects/${validated.projectId}`);
  return meeting;
}

export async function updateMeeting(id: string, input: Partial<MeetingInput>) {
  const meeting = await db.meeting.update({
    where: { id },
    data: {
      ...input,
      startTime: input.startTime ? new Date(input.startTime) : undefined,
      endTime: input.endTime ? new Date(input.endTime) : undefined,
      meetingUrl: input.meetingUrl || null,
    },
  });
  revalidatePath(`/projects/${meeting.projectId}`);
  return meeting;
}

export async function updateMeetingStatus(id: string, status: string) {
  const meeting = await db.meeting.update({
    where: { id },
    data: { status },
  });
  revalidatePath(`/projects/${meeting.projectId}`);
  return meeting;
}

export async function deleteMeeting(id: string) {
  const meeting = await db.meeting.delete({
    where: { id },
  });
  revalidatePath(`/projects/${meeting.projectId}`);
  return meeting;
}

export async function getMeetingsByProject(projectId: string) {
  return db.meeting.findMany({
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
    },
    orderBy: { startTime: "desc" },
  });
}

export async function getMeeting(id: string) {
  return db.meeting.findUnique({
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
}

export async function addMeetingAttendee(meetingId: string, userId?: string, stakeholderId?: string) {
  const attendee = await db.meetingAttendee.create({
    data: {
      meetingId,
      userId: userId || null,
      stakeholderId: stakeholderId || null,
    },
  });
  revalidatePath(`/meetings`);
  return attendee;
}

export async function removeMeetingAttendee(id: string) {
  const attendee = await db.meetingAttendee.delete({
    where: { id },
  });
  revalidatePath(`/meetings`);
  return attendee;
}

export async function updateAttendeeStatus(id: string, status: string) {
  const attendee = await db.meetingAttendee.update({
    where: { id },
    data: { status },
  });
  revalidatePath(`/meetings`);
  return attendee;
}
