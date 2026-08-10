"use client";

import { useTransition } from "react";
import { ChevronDown } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { updateTaskStatus } from "@/lib/actions/tasks";
import { STATUS_LABELS, TASK_STATUSES, type TaskStatus } from "@/lib/constants";

const STATUS_VARIANT: Record<TaskStatus, "default" | "secondary" | "warn" | "success" | "destructive"> = {
  NOT_STARTED: "secondary",
  IN_PROGRESS: "default",
  BLOCKED: "destructive",
  DONE: "success",
  CANCELLED: "secondary",
};

export function StatusMenu({
  taskId,
  projectId,
  status,
}: {
  taskId: string;
  projectId: string;
  status: TaskStatus;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isPending} className="outline-none">
        <Badge variant={STATUS_VARIANT[status]} className="cursor-pointer gap-1">
          {STATUS_LABELS[status]}
          <ChevronDown className="size-3" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {TASK_STATUSES.map((s) => (
          <DropdownMenuItem
            key={s}
            onSelect={() => startTransition(() => updateTaskStatus(taskId, projectId, s))}
          >
            {STATUS_LABELS[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
