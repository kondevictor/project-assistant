"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";
import { DONE_STATUSES, PRIORITIES, TASK_STATUSES, type Priority, type TaskStatus } from "@/lib/constants";

function parseDate(value: FormDataEntryValue | null): Date | null {
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
  const projectId = String(formData.get("projectId") ?? "");
  const title = String(formData.get("title") ?? "").trim();
  if (!projectId || !title) throw new Error("Project and task title are required");

  const phaseIdRaw = String(formData.get("phaseId") ?? "");
  const phaseId = phaseIdRaw && phaseIdRaw !== "none" ? phaseIdRaw : null;

  const priorityRaw = String(formData.get("priority") ?? "MEDIUM");
  const priority: Priority = PRIORITIES.includes(priorityRaw as Priority)
    ? (priorityRaw as Priority)
    : "MEDIUM";

  await prisma.task.create({
    data: {
      projectId,
      phaseId,
      title,
      description: String(formData.get("description") ?? "").trim() || null,
      owner: String(formData.get("owner") ?? "").trim() || null,
      priority,
      dueDate: parseDate(formData.get("dueDate")),
    },
  });

  revalidateTaskViews(projectId);
}

export async function updateTaskStatus(taskId: string, projectId: string, status: TaskStatus) {
  if (!TASK_STATUSES.includes(status)) throw new Error("Invalid status");

  await prisma.task.update({
    where: { id: taskId },
    data: {
      status,
      lastStatusChangeAt: new Date(),
      startedAt: status === "IN_PROGRESS" ? new Date() : undefined,
      completedAt: DONE_STATUSES.includes(status) ? new Date() : null,
    },
  });

  revalidateTaskViews(projectId);
}

export async function setTaskBlockedReason(taskId: string, projectId: string, reason: string) {
  await prisma.task.update({
    where: { id: taskId },
    data: { blockedReason: reason.trim() || null },
  });

  revalidateTaskViews(projectId);
}
