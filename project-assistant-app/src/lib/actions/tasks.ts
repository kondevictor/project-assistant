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

  const validated = createTaskSchema.parse({
    projectId: formData.get("projectId"),
    title: formData.get("title"),
    description: formData.get("description"),
    owner: formData.get("owner"),
    priority: formData.get("priority") || "MEDIUM",
    dueDate: formData.get("dueDate"),
    phaseId,
  });

  await prisma.task.create({
    data: {
      projectId: validated.projectId,
      phaseId: validated.phaseId || null,
      title: validated.title,
      description: validated.description || null,
      ownerId: userId,
      assigneeId: validated.owner || null,
      priority: validated.priority,
      dueDate: parseDate(validated.dueDate),
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