import { z } from "zod";
import { PROJECT_STAGES, PRIORITIES, TASK_STATUSES } from "./constants";

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  stage: z.enum(PROJECT_STAGES).default("INCEPTION"),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
});

export const createPhaseSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  name: z.string().trim().min(1, "Phase name is required").max(100),
  isMilestone: z.boolean().default(false),
  dueDate: z.string().optional().nullable(),
});

export const createTaskSchema = z.object({
  projectId: z.string().min(1, "Project ID is required"),
  title: z.string().trim().min(1, "Task title is required").max(200),
  description: z.string().trim().max(1000).optional().nullable(),
  owner: z.string().trim().max(100).optional().nullable(),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  phaseId: z.string().optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  projectId: z.string().min(1),
  status: z.enum(TASK_STATUSES),
});
