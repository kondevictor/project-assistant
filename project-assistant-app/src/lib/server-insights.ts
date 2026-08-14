import { prisma } from "@/lib/db";
import { computeProjectHealth, isOverdue, isStalled, isDueSoon } from "@/lib/insights";

export async function getDashboardData(now: Date = new Date()) {
  const projects = await prisma.project.findMany({
    where: { stage: { notIn: ["COMPLETED"] } },
    include: {
      tasks: true,
      phases: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const projectSummaries = projects.map((project) => {
    const health = computeProjectHealth({
      stage: project.stage,
      targetDate: project.targetDate,
      tasks: project.tasks,
      now,
    });

    const overdueTasks = project.tasks.filter((t) => isOverdue(t, now));
    const stalledTasks = project.tasks.filter((t) => isStalled(t, now));
    const dueSoonTasks = project.tasks.filter((t) => isDueSoon(t, now));
    const blockedNoReason = project.tasks.filter((t) => t.status === "BLOCKED" && !t.blockedReason);

    const atRiskMilestones = project.phases.filter(
      (p) => p.isMilestone && p.dueDate && !p.completedAt && p.dueDate.getTime() < now.getTime()
    );

    return {
      project,
      ...health,
      overdueTasks,
      stalledTasks,
      dueSoonTasks,
      blockedNoReason,
      atRiskMilestones,
    };
  });

  const allOverdue = projectSummaries.flatMap((p) =>
    p.overdueTasks.map((t) => ({ task: t, project: p.project }))
  );
  const allStalled = projectSummaries.flatMap((p) =>
    p.stalledTasks.map((t) => ({ task: t, project: p.project }))
  );
  const allDueSoon = projectSummaries.flatMap((p) =>
    p.dueSoonTasks.map((t) => ({ task: t, project: p.project }))
  );

  const counts = {
    green: projectSummaries.filter((p) => p.health === "GREEN").length,
    yellow: projectSummaries.filter((p) => p.health === "YELLOW").length,
    red: projectSummaries.filter((p) => p.health === "RED").length,
  };

  return { projectSummaries, allOverdue, allStalled, allDueSoon, counts };
}
