"use server";

import { revalidatePath } from "next/cache";

import { auth } from "@clerk/nextjs/server";
import { prisma } from "@/lib/db";
import { createPhaseSchema } from "@/lib/validations";

function parseDate(value: string | null | undefined): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createPhase(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  const validated = createPhaseSchema.parse({
    projectId: formData.get("projectId"),
    name: formData.get("name"),
    isMilestone: formData.get("isMilestone") === "on",
    dueDate: formData.get("dueDate"),
  });

  const maxOrder = await prisma.phase.aggregate({
    where: { projectId: validated.projectId },
    _max: { order: true },
  });

  await prisma.phase.create({
    data: {
      projectId: validated.projectId,
      name: validated.name,
      isMilestone: validated.isMilestone,
      dueDate: parseDate(validated.dueDate),
      order: (maxOrder._max.order ?? -1) + 1,
    },
  });

  revalidatePath(`/projects/${validated.projectId}`);
  revalidatePath("/");
}

export async function togglePhaseComplete(phaseId: string, projectId: string, completed: boolean) {
  const { userId } = await auth();
  if (!userId) throw new Error("Unauthorized");

  await prisma.phase.update({
    where: { id: phaseId },
    data: { completedAt: completed ? new Date() : null },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/");
}