import { z } from "zod";
import { PROJECT_STAGES, PRIORITIES, TASK_STATUSES } from "./constants";

const stakeholderSchema = z.object({
  name: z.string().trim().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email").optional().nullable(),
  phone: z.string().optional().nullable(),
  company: z.string().optional().nullable(),
  role: z.string().min(1, "Role is required"),
});

export const createProjectSchema = z.object({
  name: z.string().trim().min(1, "Project name is required").max(100),
  description: z.string().trim().max(500).optional().nullable(),
  stage: z.enum(PROJECT_STAGES).default("INCEPTION"),
  startDate: z.string().optional().nullable(),
  targetDate: z.string().optional().nullable(),
  stakeholders: z.array(stakeholderSchema).optional().default([]),
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
  assigneeId: z.string().optional().nullable(),
  stakeholderId: z.string().optional().nullable(),
  priority: z.enum(PRIORITIES).default("MEDIUM"),
  dueDate: z.string().optional().nullable(),
  phaseId: z.string().optional().nullable(),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "BLOCKED", "DONE", "CANCELLED", "PENDING", "FAILED"]).default("NOT_STARTED"),
  comments: z.string().trim().max(2000).optional().nullable(),
});

export const updateTaskStatusSchema = z.object({
  taskId: z.string().min(1),
  projectId: z.string().min(1),
  status: z.enum(TASK_STATUSES),
});
