import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";

import { prisma } from "@/lib/db";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { StageMenu } from "@/components/project/stage-menu";
import { NewPhaseDialog } from "@/components/project/new-phase-dialog";
import { NewTaskSheet } from "@/components/task/new-task-sheet";
import { TaskRow } from "@/components/task/task-row";
import { computeProjectHealth, type ProjectHealth } from "@/lib/insights";
import type { ProjectStage } from "@/lib/constants";

export async function generateStaticParams() {
  const projects = await prisma.project.findMany({ select: { id: true } });
  return projects.map((p) => ({ projectId: p.id }));
}

const HEALTH_VARIANT: Record<ProjectHealth, "success" | "warn" | "destructive"> = {
  GREEN: "success",
  YELLOW: "warn",
  RED: "destructive",
};

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;

  const project = await prisma.project.findUnique({
    where: { id: projectId },
    include: {
      phases: { orderBy: { order: "asc" }, include: { tasks: true } },
      tasks: { where: { phaseId: null }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!project) notFound();

  const { health } = computeProjectHealth({
    stage: project.stage,
    targetDate: project.targetDate,
    tasks: [...project.tasks, ...project.phases.flatMap((p) => p.tasks)],
  });

  const phaseSummaries = project.phases.map((p) => ({ id: p.id, name: p.name }));

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-2xl font-semibold">{project.name}</h1>
          <Badge variant={HEALTH_VARIANT[health]}>{health}</Badge>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <StageMenu projectId={project.id} stage={project.stage as ProjectStage} />
          {project.targetDate && (
            <span className="text-muted-foreground text-sm">
              Target: {project.targetDate.toLocaleDateString()}
            </span>
          )}
        </div>
        {project.description && <p className="text-muted-foreground text-sm">{project.description}</p>}
      </div>

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Phases</h2>
        <NewPhaseDialog projectId={project.id} />
      </div>

      {project.phases.length === 0 ? (
        <p className="text-muted-foreground text-sm">No phases yet — add one to organize tasks by milestone.</p>
      ) : (
        <div className="flex flex-col gap-6">
          {project.phases.map((phase) => (
            <div key={phase.id} className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-medium">{phase.name}</h3>
                {phase.isMilestone && (
                  <Badge variant="outline" className="gap-1">
                    <CheckCircle2 className="size-3" /> Milestone
                  </Badge>
                )}
                {phase.dueDate && (
                  <span className="text-muted-foreground text-xs">
                    Due {phase.dueDate.toLocaleDateString()}
                  </span>
                )}
                {phase.completedAt && (
                  <Badge variant="success">Completed</Badge>
                )}
                <div className="ml-auto">
                  <NewTaskSheet
                    projectId={project.id}
                    phases={phaseSummaries}
                    defaultPhaseId={phase.id}
                    triggerLabel="Add Task"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                {phase.tasks.length === 0 ? (
                  <p className="text-muted-foreground text-sm">No tasks in this phase yet.</p>
                ) : (
                  phase.tasks.map((task) => <TaskRow key={task.id} task={task} />)
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Separator />

      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">Other tasks</h2>
        <NewTaskSheet projectId={project.id} phases={phaseSummaries} triggerLabel="Add Task" />
      </div>

      <div className="flex flex-col gap-2">
        {project.tasks.length === 0 ? (
          <p className="text-muted-foreground text-sm">No unphased tasks.</p>
        ) : (
          project.tasks.map((task) => <TaskRow key={task.id} task={task} />)
        )}
      </div>
    </div>
  );
}
