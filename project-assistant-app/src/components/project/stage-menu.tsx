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
import { updateProjectStage } from "@/lib/actions/projects";
import { PROJECT_STAGES, STAGE_LABELS, type ProjectStage } from "@/lib/constants";

export function StageMenu({ projectId, stage }: { projectId: string; stage: ProjectStage }) {
  const [isPending, startTransition] = useTransition();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger disabled={isPending} className="outline-none">
        <Badge variant="outline" className="cursor-pointer gap-1">
          {STAGE_LABELS[stage]}
          <ChevronDown className="size-3" />
        </Badge>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        {PROJECT_STAGES.map((s) => (
          <DropdownMenuItem
            key={s}
            onSelect={() => startTransition(() => updateProjectStage(projectId, s))}
          >
            {STAGE_LABELS[s]}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
