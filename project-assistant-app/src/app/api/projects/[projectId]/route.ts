import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ projectId: string }> }
) {
  const { projectId } = await params;

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      phases: {
        orderBy: { order: "asc" },
        include: { tasks: { include: { stakeholder: true } } },
      },
      tasks: {
        where: { phaseId: null },
        orderBy: { createdAt: "desc" },
        include: { stakeholder: true },
      },
      stakeholders: true,
      meetings: {
        include: {
          organizer: true,
          attendees: {
            include: {
              user: true,
              stakeholder: true,
            },
          },
          transcription: true,
        },
        orderBy: { startTime: "desc" },
      },
      events: {
        include: { user: true },
        orderBy: { createdAt: "desc" },
      },
      stakeholderTasks: {
        include: { stakeholder: true },
        orderBy: { dueDate: "asc" },
      },
      generatedDocuments: {
        include: { template: true },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json(project);
}
