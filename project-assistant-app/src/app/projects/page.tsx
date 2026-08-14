import Link from "next/link";

import { prisma } from "@/lib/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NewProjectDialog } from "@/components/project/new-project-dialog";
import { STAGE_LABELS, type ProjectStage } from "@/lib/constants";
import { computeProjectHealth, type ProjectHealth } from "@/lib/insights";

export const dynamic = "force-dynamic";

const HEALTH_VARIANT: Record<ProjectHealth, "success" | "warn" | "destructive"> = {
  GREEN: "success",
  YELLOW: "warn",
  RED: "destructive",
};

export default async function ProjectsPage() {
  const projects = await prisma.project.findMany({
    include: { tasks: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Projects</h1>
        <NewProjectDialog />
      </div>

      {projects.length === 0 ? (
        <p className="text-muted-foreground text-sm">No projects yet. Create your first one.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => {
            const { health } = computeProjectHealth({
              stage: project.stage,
              targetDate: project.targetDate,
              tasks: project.tasks,
            });
            const openTasks = project.tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED");

            return (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className="h-full transition-colors hover:bg-accent/50">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle>{project.name}</CardTitle>
                      <Badge variant={HEALTH_VARIANT[health]}>{health}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <Badge variant="outline">{STAGE_LABELS[project.stage as ProjectStage]}</Badge>
                    <p className="text-muted-foreground text-sm">
                      {openTasks.length} open task{openTasks.length === 1 ? "" : "s"}
                    </p>
                    {project.targetDate && (
                      <p className="text-muted-foreground text-xs">
                        Target: {project.targetDate.toLocaleDateString()}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
