import Link from "next/link";
import { AlertTriangle, Clock, CheckCircle2, ArrowRight } from "lucide-react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewProjectDialog } from "@/components/project/new-project-dialog";
import { TaskRow } from "@/components/task/task-row";
import { getDashboardData, type ProjectHealth } from "@/lib/insights";
import { STAGE_LABELS, type ProjectStage } from "@/lib/constants";

const HEALTH_VARIANT: Record<ProjectHealth, "success" | "warn" | "destructive"> = {
  GREEN: "success",
  YELLOW: "warn",
  RED: "destructive",
};

export default async function DashboardPage() {
  const { projectSummaries, allOverdue, allStalled, counts } = await getDashboardData();

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Executive Dashboard</h1>
          <p className="text-muted-foreground text-sm">
            Overview of project health, upcoming deadlines, and stalled tasks.
          </p>
        </div>
        <NewProjectDialog />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card className="border-emerald-200 bg-emerald-50/50 dark:border-emerald-950 dark:bg-emerald-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-emerald-700 dark:text-emerald-400 text-xs font-semibold uppercase tracking-wider">
                On Track (Green)
              </p>
              <p className="text-3xl font-bold text-emerald-900 dark:text-emerald-100">{counts.green}</p>
            </div>
            <CheckCircle2 className="size-8 text-emerald-600 dark:text-emerald-400" />
          </CardContent>
        </Card>

        <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-950 dark:bg-amber-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-amber-700 dark:text-amber-400 text-xs font-semibold uppercase tracking-wider">
                Needs Attention (Yellow)
              </p>
              <p className="text-3xl font-bold text-amber-900 dark:text-amber-100">{counts.yellow}</p>
            </div>
            <Clock className="size-8 text-amber-600 dark:text-amber-400" />
          </CardContent>
        </Card>

        <Card className="border-rose-200 bg-rose-50/50 dark:border-rose-950 dark:bg-rose-950/20">
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-rose-700 dark:text-rose-400 text-xs font-semibold uppercase tracking-wider">
                At Risk (Red)
              </p>
              <p className="text-3xl font-bold text-rose-900 dark:text-rose-100">{counts.red}</p>
            </div>
            <AlertTriangle className="size-8 text-rose-600 dark:text-rose-400" />
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          <Link href="/projects" className="text-muted-foreground hover:text-foreground flex items-center gap-1 text-sm font-medium">
            View all projects <ArrowRight className="size-4" />
          </Link>
        </div>

        {projectSummaries.length === 0 ? (
          <Card className="p-8 text-center">
            <p className="text-muted-foreground text-sm">No active projects found.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {projectSummaries.map(({ project, health, score, overdueCount, stalledCount, blockedCount }) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="line-clamp-1">{project.name}</CardTitle>
                      <Badge variant={HEALTH_VARIANT[health]}>{health}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-3">
                    <div className="flex items-center justify-between text-xs">
                      <Badge variant="outline">{STAGE_LABELS[project.stage as ProjectStage]}</Badge>
                      <span className="text-muted-foreground font-mono">Score: {score}/100</span>
                    </div>

                    <div className="text-muted-foreground flex flex-wrap gap-x-4 gap-y-1 text-xs">
                      <span>{overdueCount} overdue</span>
                      <span>{stalledCount} stalled</span>
                      <span>{blockedCount} blocked</span>
                    </div>

                    {project.targetDate && (
                      <p className="text-muted-foreground text-xs">
                        Target: {project.targetDate.toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="text-destructive size-5" />
            <h2 className="text-lg font-semibold">Overdue Tasks ({allOverdue.length})</h2>
          </div>
          {allOverdue.length === 0 ? (
            <p className="text-muted-foreground text-sm">No overdue tasks.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {allOverdue.slice(0, 5).map(({ task }) => (
                <TaskRow key={task.id} task={task} showProjectLink />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Clock className="text-amber-500 size-5" />
            <h2 className="text-lg font-semibold">Stalled Tasks ({allStalled.length})</h2>
          </div>
          {allStalled.length === 0 ? (
            <p className="text-muted-foreground text-sm">No stalled tasks.</p>
          ) : (
            <div className="flex flex-col gap-2">
              {allStalled.slice(0, 5).map(({ task }) => (
                <TaskRow key={task.id} task={task} showProjectLink />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
