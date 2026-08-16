import Link from "next/link";
import { prisma } from "@/lib/db";
import { TaskRow } from "@/components/task/task-row";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const dynamic = "force-dynamic";

export default async function TasksPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status: filterStatus } = await searchParams;

  const tasks = await prisma.task.findMany({
    include: { project: true, stakeholder: true, assignee: true },
    orderBy: [
      { dueDate: "asc" },
      { createdAt: "desc" },
    ],
  });

  const totalCount = tasks.length;
  const openCount = tasks.filter((t) => t.status !== "DONE" && t.status !== "CANCELLED").length;
  const blockedCount = tasks.filter((t) => t.status === "BLOCKED").length;
  const doneCount = tasks.filter((t) => t.status === "DONE").length;

  const filteredTasks = tasks.filter((t) => {
    if (!filterStatus || filterStatus === "all") return true;
    if (filterStatus === "open") return t.status !== "DONE" && t.status !== "CANCELLED";
    return t.status.toLowerCase() === filterStatus.toLowerCase();
  });

  const filters = [
    { label: "All Tasks", value: "all", count: totalCount },
    { label: "Open", value: "open", count: openCount },
    { label: "Blocked", value: "blocked", count: blockedCount },
    { label: "Done", value: "done", count: doneCount },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Global Tasks</h1>
        <p className="text-muted-foreground text-sm">
          Track and manage tasks across all active projects.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">Total Tasks</p>
            <p className="text-2xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">Open Tasks</p>
            <p className="text-2xl font-bold text-blue-600">{openCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">Blocked</p>
            <p className="text-2xl font-bold text-rose-600">{blockedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <p className="text-muted-foreground text-xs font-medium uppercase">Completed</p>
            <p className="text-2xl font-bold text-emerald-600">{doneCount}</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex items-center gap-2 border-b pb-2">
        {filters.map((f) => {
          const isActive = (!filterStatus && f.value === "all") || filterStatus === f.value;
          return (
            <Link key={f.value} href={f.value === "all" ? "/tasks" : `/tasks?status=${f.value}`}>
              <Badge
                variant={isActive ? "default" : "outline"}
                className="cursor-pointer gap-1.5 px-3 py-1 text-xs"
              >
                {f.label}
                <span className="opacity-75">({f.count})</span>
              </Badge>
            </Link>
          );
        })}
      </div>

      <div className="flex flex-col gap-2">
        {filteredTasks.length === 0 ? (
          <p className="text-muted-foreground py-8 text-center text-sm">
            No tasks matching the selected filter.
          </p>
        ) : (
          filteredTasks.map((task) => (
            <TaskRow key={task.id} task={task} showProjectLink />
          ))
        )}
      </div>
    </div>
  );
}
