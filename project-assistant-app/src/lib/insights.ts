import { DONE_STATUSES, DUE_SOON_THRESHOLD_DAYS, STALLED_THRESHOLD_DAYS, type TaskStatus } from "@/lib/constants";

type TaskLike = {
  status: string;
  dueDate: Date | null;
  lastStatusChangeAt: Date;
};

function daysBetween(a: Date, b: Date) {
  return (a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24);
}

function isDone(status: string) {
  return DONE_STATUSES.includes(status as TaskStatus);
}

export function isOverdue(task: TaskLike, now: Date = new Date()) {
  if (isDone(task.status) || !task.dueDate) return false;
  return task.dueDate.getTime() < now.getTime();
}

export function isDueSoon(task: TaskLike, now: Date = new Date()) {
  if (isDone(task.status) || !task.dueDate || isOverdue(task, now)) return false;
  return daysBetween(task.dueDate, now) >= -DUE_SOON_THRESHOLD_DAYS;
}

export function isStalled(task: TaskLike, now: Date = new Date()) {
  if (isDone(task.status)) return false;
  return daysBetween(now, task.lastStatusChangeAt) >= STALLED_THRESHOLD_DAYS;
}

export type ProjectHealth = "GREEN" | "YELLOW" | "RED";

export function computeProjectHealth(params: {
  stage: string;
  targetDate: Date | null;
  tasks: TaskLike[];
  now?: Date;
}): { health: ProjectHealth; score: number; overdueCount: number; stalledCount: number; blockedCount: number } {
  const now = params.now ?? new Date();

  if (params.stage === "COMPLETED" || params.stage === "ON_HOLD") {
    return { health: "GREEN", score: 100, overdueCount: 0, stalledCount: 0, blockedCount: 0 };
  }

  const overdueCount = params.tasks.filter((t) => isOverdue(t, now)).length;
  const stalledCount = params.tasks.filter((t) => isStalled(t, now)).length;
  const blockedCount = params.tasks.filter((t) => t.status === "BLOCKED").length;

  let score = 100;
  score -= overdueCount * 15;
  score -= stalledCount * 10;
  score -= blockedCount * 5;

  if (params.targetDate && params.targetDate.getTime() < now.getTime()) {
    const daysPast = daysBetween(now, params.targetDate);
    score -= Math.min(30, Math.floor(daysPast));
  }

  score = Math.max(0, Math.min(100, score));

  const health: ProjectHealth = score >= 80 ? "GREEN" : score >= 50 ? "YELLOW" : "RED";

  return { health, score, overdueCount, stalledCount, blockedCount };
}
