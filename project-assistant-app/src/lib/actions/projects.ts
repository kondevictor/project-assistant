"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { type ProjectStage } from "@/lib/constants";
import { createProjectSchema } from "@/lib/validations";

function parseDate(value: string | null | undefined): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createProject(formData: FormData) {
  const validated = createProjectSchema.parse({
    name: formData.get("name"),
    description: formData.get("description"),
    stage: formData.get("stage") || "INCEPTION",
    startDate: formData.get("startDate"),
    targetDate: formData.get("targetDate"),
  });

  const project = await prisma.project.create({
    data: {
      name: validated.name,
      description: validated.description || null,
      stage: validated.stage,
      startDate: parseDate(validated.startDate),
      targetDate: parseDate(validated.targetDate),
    },
  });

  revalidatePath("/projects");
  revalidatePath("/");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectStage(projectId: string, stage: ProjectStage) {
  await prisma.project.update({
    where: { id: projectId },
    data: {
      stage,
      completedAt: stage === "COMPLETED" ? new Date() : null,
    },
  });

  revalidatePath(`/projects/${projectId}`);
  revalidatePath("/projects");
  revalidatePath("/");
}
