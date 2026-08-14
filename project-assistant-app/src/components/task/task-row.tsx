import Link from "next/link";
import { AlertTriangle, Clock } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { StatusMenu } from "@/components/task/status-menu";
import { PRIORITY_LABELS, type Priority, type TaskStatus } from "@/lib/constants";
import { isOverdue, isStalled, toDate } from "@/lib/insights";
import { cn } from "@/lib/utils";

const PRIORITY_VARIANT: Record<Priority, "outline" | "warn" | "destructive"> = {
  LOW: "outline",
  MEDIUM: "outline",
  HIGH: "warn",
  CRITICAL: "destructive",
};

export type TaskRowData = {
  id: string;
  projectId: string;
  title: string;
  ownerId: string | null;
  status: string;
  priority: string;
  dueDate: Date | string | null;
  lastStatusChangeAt: Date | string;
  blockedReason: string | null;
};

export function TaskRow({ task, showProjectLink }: { task: TaskRowData; showProjectLink?: boolean }) {
  const status = task.status as TaskStatus;
  const priority = task.priority as Priority;
  const overdue = isOverdue(task);
  const stalled = isStalled(task);
  const dueDate = toDate(task.dueDate);

  return (
    <div className="flex flex-col gap-2 rounded-lg border p-3 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col gap-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium">{task.title}</span>
          <Badge variant={PRIORITY_VARIANT[priority]}>{PRIORITY_LABELS[priority]}</Badge>
          {overdue && (
            <Badge variant="destructive" className="gap-1">
              <AlertTriangle className="size-3" /> Overdue
            </Badge>
          )}
          {!overdue && stalled && (
            <Badge variant="warn" className="gap-1">
              <Clock className="size-3" /> Stalled
            </Badge>
          )}
        </div>
        <div className="text-muted-foreground flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
          {dueDate && (
            <span className={cn(overdue && "text-destructive font-medium")}>
              Due {dueDate.toLocaleDateString()}
            </span>
          )}
          {task.ownerId && <span>{task.ownerId}</span>}
          {task.status === "BLOCKED" && task.blockedReason && <span>Blocked: {task.blockedReason}</span>}
          {showProjectLink && (
            <Link href={`/projects/${task.projectId}`} className="underline underline-offset-2">
              View project
            </Link>
          )}
        </div>
      </div>
      <StatusMenu taskId={task.id} projectId={task.projectId} status={status} />
    </div>
  );
}
