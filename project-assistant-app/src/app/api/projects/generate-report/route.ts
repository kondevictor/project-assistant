import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import {
  Document,
  Packer,
  Paragraph,
  TextRun,
  HeadingLevel,
  AlignmentType,
} from "docx";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { projectId } = body;

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 });
  }

  const project = await db.project.findUnique({
    where: { id: projectId },
    include: {
      owner: true,
      phases: {
        include: { tasks: true },
      },
      tasks: true,
      stakeholders: true,
      meetings: true,
      events: true,
      stakeholderTasks: {
        include: { stakeholder: true },
      },
    },
  });

  if (!project) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  // Calculate statistics
  const totalTasks = [...project.tasks, ...project.phases.flatMap((p) => p.tasks)].length;
  const completedTasks = [...project.tasks, ...project.phases.flatMap((p) => p.tasks)].filter(
    (t) => t.status === "DONE"
  ).length;
  const overdueTasks = [...project.tasks, ...project.phases.flatMap((p) => p.tasks)].filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "DONE"
  ).length;
  const blockedTasks = [...project.tasks, ...project.phases.flatMap((p) => p.tasks)].filter(
    (t) => t.status === "BLOCKED"
  ).length;

  const completedPhases = project.phases.filter((p) => p.completedAt).length;
  const overdueStakeholderTasks = project.stakeholderTasks.filter(
    (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== "completed"
  ).length;

  const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Generate report content
  const reportContent = `
PROJECT STATUS REPORT

Project: ${project.name}
Description: ${project.description || "No description"}
Owner: ${project.owner?.name || project.owner?.email || "Unknown"}
Report Date: ${new Date().toLocaleDateString()}
Current Stage: ${project.stage}

EXECUTIVE SUMMARY
This report provides an overview of the project status as of ${new Date().toLocaleDateString()}.

PROJECT STATISTICS
- Total Tasks: ${totalTasks}
- Completed Tasks: ${completedTasks} (${completionPercentage}%)
- Overdue Tasks: ${overdueTasks}
- Blocked Tasks: ${blockedTasks}

- Total Phases: ${project.phases.length}
- Completed Phases: ${completedPhases}

- Stakeholders: ${project.stakeholders.length}
- Meetings Held: ${project.meetings.length}
- Project Events: ${project.events.length}

STAKEHOLDER TASKS
- Total Stakeholder Tasks: ${project.stakeholderTasks.length}
- Overdue Stakeholder Tasks: ${overdueStakeholderTasks}

${overdueStakeholderTasks > 0 ? "WARNING: There are overdue stakeholder tasks that require attention." : ""}

PHASE DETAILS
${project.phases
  .map(
    (phase) => `
Phase: ${phase.name}
- Status: ${phase.completedAt ? "Completed" : "In Progress"}
- Tasks: ${phase.tasks.length}
- Completed Tasks: ${phase.tasks.filter((t) => t.status === "DONE").length}
`
  )
  .join("")}

STAKEHOLDER SUMMARY
${project.stakeholders
  .map(
    (stakeholder) => `
- ${stakeholder.name} (${stakeholder.role})
  ${stakeholder.email ? `Email: ${stakeholder.email}` : ""}
  ${stakeholder.company ? `Company: ${stakeholder.company}` : ""}
`
  )
  .join("")}

RECENT EVENTS
${project.events
  .slice(0, 10)
  .map(
    (event) => `
- ${event.title} (${new Date(event.createdAt).toLocaleDateString()})
  ${event.description || ""}
`
  )
  .join("")}

MEETINGS SUMMARY
- Total Meetings: ${project.meetings.length}
- Completed Meetings: ${project.meetings.filter((m) => m.status === "completed").length}
- Upcoming Meetings: ${project.meetings.filter((m) => m.status === "scheduled").length}

RECOMMENDATIONS
${overdueTasks > 0 ? "- Address overdue tasks immediately" : ""}
${blockedTasks > 0 ? "- Resolve blocked tasks to maintain progress" : ""}
${overdueStakeholderTasks > 0 ? "- Follow up on overdue stakeholder tasks" : ""}
${completionPercentage < 50 ? "- Project is less than 50% complete - ensure adequate resources" : ""}
${project.phases.length === 0 ? "- Consider adding phases to better organize tasks" : ""}

END OF REPORT
`;

  // Create DOCX
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: [
          new Paragraph({
            children: [
              new TextRun({
                text: `Project Status Report - ${project.name}`,
                bold: true,
                size: 32,
              }),
            ],
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
          }),
          new Paragraph({
            children: [],
          }),
          ...reportContent.split("\n").map(
            (line) =>
              new Paragraph({
                children: [
                  new TextRun({
                    text: line,
                    size: 24,
                  }),
                ],
                spacing: {
                  after: 120,
                },
              })
          ),
        ],
      },
    ],
  });

  // Generate buffer
  const buffer = await Packer.toBuffer(doc);
  const base64 = buffer.toString("base64");

  const fileName = `Project_Report_${project.name.replace(/\s+/g, "_")}_${new Date().toISOString().split("T")[0]}.docx`;

  return NextResponse.json({
    base64,
    fileName,
    stats: {
      totalTasks,
      completedTasks,
      overdueTasks,
      blockedTasks,
      completionPercentage,
    },
  });
}
