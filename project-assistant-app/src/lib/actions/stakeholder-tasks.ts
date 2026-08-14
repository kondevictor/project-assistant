"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const StakeholderTaskSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  stakeholderId: z.string().min(1, "Stakeholder ID is required"),
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  status: z.string().optional(),
  priority: z.string().optional(),
  dueDate: z.string().datetime().optional(),
});

export type StakeholderTaskInput = z.infer<typeof StakeholderTaskSchema>;

export async function createStakeholderTask(input: StakeholderTaskInput) {
  const validated = StakeholderTaskSchema.parse(input);
  const task = await db.stakeholderTask.create({
    data: {
      ...validated,
      description: validated.description || null,
      status: validated.status || "pending",
      priority: validated.priority || "medium",
      dueDate: validated.dueDate ? new Date(validated.dueDate) : null,
    },
  });
  revalidatePath(`/projects/${validated.projectId}`);
  return task;
}

export async function updateStakeholderTask(id: string, input: Partial<StakeholderTaskInput>) {
  const task = await db.stakeholderTask.update({
    where: { id },
    data: {
      ...input,
      dueDate: input.dueDate ? new Date(input.dueDate) : undefined,
      completedAt: input.status === "completed" ? new Date() : undefined,
    },
  });
  revalidatePath(`/projects/${task.projectId}`);
  return task;
}

export async function deleteStakeholderTask(id: string) {
  const task = await db.stakeholderTask.delete({
    where: { id },
  });
  revalidatePath(`/projects/${task.projectId}`);
  return task;
}

export async function getStakeholderTasksByProject(projectId: string) {
  return db.stakeholderTask.findMany({
    where: { projectId },
    include: {
      stakeholder: true,
      project: true,
    },
    orderBy: { dueDate: "asc" },
  });
}

export async function getStakeholderTasksByStakeholder(stakeholderId: string) {
  return db.stakeholderTask.findMany({
    where: { stakeholderId },
    include: { project: true },
    orderBy: { dueDate: "asc" },
  });
}

export async function getOverdueStakeholderTasks(projectId: string) {
  const now = new Date();
  return db.stakeholderTask.findMany({
    where: {
      projectId,
      dueDate: { lt: now },
      status: { notIn: ["completed", "overdue"] },
    },
    include: { stakeholder: true },
  });
}

export async function markTaskOverdue(id: string) {
  const task = await db.stakeholderTask.update({
    where: { id },
    data: { status: "overdue" },
  });
  revalidatePath(`/projects/${task.projectId}`);
  return task;
}

export async function markReminderSent(id: string) {
  const task = await db.stakeholderTask.update({
    where: { id },
    data: { reminderSent: true },
  });
  return task;
}

// Get tasks needing reminders (due within 24 hours and reminder not sent)
export async function getTasksNeedingReminders() {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return db.stakeholderTask.findMany({
    where: {
      dueDate: {
        gte: now,
        lte: tomorrow,
      },
      status: { notIn: ["completed", "overdue"] },
      reminderSent: false,
    },
    include: {
      stakeholder: true,
      project: true,
    },
  });
}
