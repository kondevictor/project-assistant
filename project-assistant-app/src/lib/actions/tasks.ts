"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { DONE_STATUSES, type TaskStatus } from "@/lib/constants";
import { createTaskSchema, updateTaskStatusSchema } from "@/lib/validations";

function parseDate(value: string | null | undefined): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function revalidateTaskViews(projectId: string) {
  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/tasks");
  revalidatePath("/");
}

export async function createTask(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const phaseIdRaw = String(formData.get("phaseId") ?? "");
  const phaseId = phaseIdRaw && phaseIdRaw !== "none" ? phaseIdRaw : null;

  const stakeholderIdRaw = String(formData.get("stakeholderId") ?? "");
  const stakeholderId = stakeholderIdRaw && stakeholderIdRaw !== "none" ? stakeholderIdRaw : null;

  const validated = createTaskSchema.parse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    assigneeId: formData.get("assigneeId"),
    stakeholderId: formData.get("stakeholderId"),
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate"),
    phaseId,
    status: formData.get("status") || "NOT_STARTED",
    comments: formData.get("comments"),
  });

  await prisma.task.create({
    data: {
      projectId: validated.projectId,
      phaseId: validated.phaseId || null,
      title: validated.title,
      description: validated.description || null,
      ownerId: userId,
      assigneeId: validated.assigneeId || null,
      stakeholderId: stakeholderId,
      priority: validated.priority,
      dueDate: parseDate(validated.dueDate),
      status: validated.status,
    },
  });

  revalidateTaskViews(validated.projectId);
}

export async function updateTaskStatus(taskId: string, projectId: string, status: TaskStatus) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = updateTaskStatusSchema.parse({ taskId, projectId, status });

  await prisma.task.update({
    where: { id: validated.taskId },
    data: {
      status: validated.status,
      lastStatusChangeAt: new Date(),
      startedAt: validated.status === "IN_PROGRESS" ? new Date() : undefined,
      completedAt: DONE_STATUSES.includes(validated.status) ? new Date() : null,
    },
  });

  revalidateTaskViews(validated.projectId);
}

export async function setTaskBlockedReason(taskId: string, projectId: string, reason: string) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.update({
    where: { id: taskId },
    data: { blockedReason: reason.trim() || null },
  });

  revalidateTaskViews(projectId);
}

export async function updateTask(taskId: string, projectId: string, data: {
  title?: string;
  description?: string;
  assigneeId?: string | null;
  stakeholderId?: string | null;
  priority?: string;
  dueDate?: string | null;
  status?: string;
  comments?: string | null;
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      title: data.title,
      description: data.description,
      assigneeId: data.assigneeId,
      stakeholderId: data.stakeholderId,
      priority: data.priority,
      dueDate: parseDate(data.dueDate),
      status: data.status as TaskStatus,
      // comments would need a separate field or notes table
    },
  });

  revalidateTaskViews(projectId);
}