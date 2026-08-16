export const PROJECT_STAGES = [
  "INCEPTION",
  "PLANNING",
  "EXECUTION",
  "REVIEW",
  "COMPLETED",
  "ON_HOLD",
] as const;
export type ProjectStage = (typeof PROJECT_STAGES)[number];

export const TASK_STATUSES = [
  "NOT_STARTED",
  "PENDING",
  "IN_PROGRESS",
  "BLOCKED",
  "DONE",
  "FAILED",
  "CANCELLED",
] as const;
export type TaskStatus = (typeof TASK_STATUSES)[number];

export const DONE_STATUSES: TaskStatus[] = ["DONE", "CANCELLED", "FAILED"];

export const PRIORITIES = ["LOW", "MEDIUM", "HIGH", "CRITICAL"] as const;
export type Priority = (typeof PRIORITIES)[number];

export const SOURCE_TYPES = ["MANUAL", "DOCUMENT", "MEETING", "CALENDAR"] as const;
export type SourceType = (typeof SOURCE_TYPES)[number];

export const STAGE_LABELS: Record<ProjectStage, string> = {
  INCEPTION: "Inception",
  PLANNING: "Planning",
  EXECUTION: "Execution",
  REVIEW: "Review",
  COMPLETED: "Completed",
  ON_HOLD: "On Hold",
};

export const STATUS_LABELS: Record<TaskStatus, string> = {
  NOT_STARTED: "Not Started",
  PENDING: "Pending",
  IN_PROGRESS: "In Progress",
  BLOCKED: "Blocked",
  DONE: "Done",
  FAILED: "Failed",
  CANCELLED: "Cancelled",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
  CRITICAL: "Critical",
};

export const STALLED_THRESHOLD_DAYS = 7;
export const DUE_SOON_THRESHOLD_DAYS = 3;
