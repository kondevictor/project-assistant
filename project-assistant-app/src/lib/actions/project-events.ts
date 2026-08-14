"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const ProjectEventSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  userId: z.string().optional(),
  type: z.string().min(1, "Type is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  metadata: z.any().optional(),
});

export type ProjectEventInput = z.infer<typeof ProjectEventSchema>;

export async function createProjectEvent(input: ProjectEventInput) {
  const validated = ProjectEventSchema.parse(input);
  const event = await db.projectEvent.create({
    data: {
      ...validated,
      userId: validated.userId || null,
      description: validated.description || null,
      metadata: validated.metadata || null,
    },
  });
  revalidatePath(`/projects/${validated.projectId}`);
  return event;
}

export async function getProjectEvents(projectId: string) {
  return db.projectEvent.findMany({
    where: { projectId },
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function deleteProjectEvent(id: string) {
  const event = await db.projectEvent.delete({
    where: { id },
  });
  revalidatePath(`/projects/${event.projectId}`);
  return event;
}

// Helper to create common event types
export async function logStatusChange(projectId: string, oldStage: string, newStage: string, userId?: string) {
  return createProjectEvent({
    projectId,
    userId,
    type: "status_change",
    title: `Project stage changed`,
    description: `Changed from ${oldStage} to ${newStage}`,
    metadata: { oldStage, newStage },
  });
}

export async function logMilestoneReached(projectId: string, milestoneName: string, userId?: string) {
  return createProjectEvent({
    projectId,
    userId,
    type: "milestone_reached",
    title: `Milestone reached: ${milestoneName}`,
    description: `The milestone "${milestoneName}" has been completed`,
  });
}

export async function logStakeholderAdded(projectId: string, stakeholderName: string, userId?: string) {
  return createProjectEvent({
    projectId,
    userId,
    type: "stakeholder_added",
    title: `Stakeholder added: ${stakeholderName}`,
    description: `A new stakeholder has been added to the project`,
  });
}

export async function logMeetingScheduled(projectId: string, meetingTitle: string, startTime: Date, userId?: string) {
  return createProjectEvent({
    projectId,
    userId,
    type: "meeting_scheduled",
    title: `Meeting scheduled: ${meetingTitle}`,
    description: `Meeting scheduled for ${startTime.toLocaleString()}`,
    metadata: { startTime: startTime.toISOString() },
  });
}
