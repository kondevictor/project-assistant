"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const StakeholderSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().optional(),
  role: z.string().min(1, "Role is required"),
  notes: z.string().optional(),
});

export type StakeholderInput = z.infer<typeof StakeholderSchema>;

export async function createStakeholder(input: StakeholderInput) {
  const validated = StakeholderSchema.parse(input);
  const stakeholder = await db.stakeholder.create({
    data: {
      ...validated,
      email: validated.email || null,
    },
  });
  revalidatePath(`/projects/${validated.projectId}`);
  return stakeholder;
}

export async function updateStakeholder(id: string, input: Partial<StakeholderInput>) {
  const stakeholder = await db.stakeholder.update({
    where: { id },
    data: {
      ...input,
      email: input.email || null,
    },
  });
  revalidatePath(`/projects/${stakeholder.projectId}`);
  return stakeholder;
}

export async function deleteStakeholder(id: string) {
  const stakeholder = await db.stakeholder.delete({
    where: { id },
  });
  revalidatePath(`/projects/${stakeholder.projectId}`);
  return stakeholder;
}

export async function getStakeholdersByProject(projectId: string) {
  return db.stakeholder.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
}

export async function getStakeholder(id: string) {
  return db.stakeholder.findUnique({
    where: { id },
    include: {
      project: true,
      meetingAttendees: {
        include: { meeting: true },
      },
    },
  });
}
