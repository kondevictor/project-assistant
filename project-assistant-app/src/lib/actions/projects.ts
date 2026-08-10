"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import { PROJECT_STAGES, type ProjectStage } from "@/lib/constants";

function parseDate(value: FormDataEntryValue | null): Date | null {
  if (!value || typeof value !== "string" || value.trim() === "") return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

export async function createProject(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();
  if (!name) throw new Error("Project name is required");

  const stageRaw = String(formData.get("stage") ?? "INCEPTION");
  const stage: ProjectStage = PROJECT_STAGES.includes(stageRaw as ProjectStage)
    ? (stageRaw as ProjectStage)
    : "INCEPTION";

  const project = await prisma.project.create({
    data: {
      name,
      description: String(formData.get("description") ?? "").trim() || null,
      stage,
      startDate: parseDate(formData.get("startDate")),
      targetDate: parseDate(formData.get("targetDate")),
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
