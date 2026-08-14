import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId, stakeholderId, title, description, priority, dueDate } = body;

  if (!projectId || !stakeholderId || !title) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const task = await db.stakeholderTask.create({
    data: {
      projectId,
      stakeholderId,
      title,
      description: description || null,
      priority: priority || "medium",
      dueDate: dueDate ? new Date(dueDate) : null,
    },
    include: {
      stakeholder: true,
      project: true,
    },
  });

  return NextResponse.json(task, { status: 201 });
}

export async function GET(request: NextRequest) {
  const projectId = request.nextUrl.searchParams.get("projectId");
  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const tasks = await db.stakeholderTask.findMany({
    where: { projectId },
    include: {
      stakeholder: true,
      project: true,
    },
    orderBy: { dueDate: "asc" },
  });

  return NextResponse.json(tasks);
}
