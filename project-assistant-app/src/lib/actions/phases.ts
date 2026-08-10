"use server";

import { revalidatePath } from "next/cache";

import { prisma } from "@/lib/db";

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createPhase(formData: FormData) {
  const projectId = String(formData.get("projectId") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  if (!projectId || !name) throw new Error("Project and phase name are required");

  const maxOrder = await prisma.phase.aggregate({
    where: { projectId },
    _max: { order: true },
  });

  await prisma.phase.create({
    data: {
      projectId,
      name,
      isMilestone: formData.get("isMilestone") === "on",
      dueDate: parseDate(formData.get("dueDate")),
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}

export async function togglePhaseComplete(phaseId: string, projectId: string, completed: boolean) {
  await prisma.phase.update({
    where: { id: phaseId },
    data: { completedAt: completed ? new Date() : null },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}
