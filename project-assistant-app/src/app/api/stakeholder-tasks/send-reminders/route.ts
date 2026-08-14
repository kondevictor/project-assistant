import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function POST(request: NextRequest) {
  const now = new Date();
  const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  // Find tasks due within 24 hours that haven't had reminders sent
  const tasksNeedingReminders = await db.stakeholderTask.findMany({
    where: {
      dueDate: {
        gte: now,
        lte: tomorrow,
      },
      status: { notIn: ["completed", "overdue"] },
      reminderSent: false,
    },
    include: {
      stakeholder: true,
      project: true,
    },
  });

  const reminders = [];

  for (const task of tasksNeedingReminders) {
    // Create notification for the task reminder
    const notification = await db.notification.create({
      data: {
        userId: task.project.ownerId,
        type: "in_app",
        title: `Reminder: Task due soon`,
        message: `Task "${task.title}" assigned to ${task.stakeholder.name} is due ${task.dueDate ? new Date(task.dueDate).toLocaleDateString() : "soon"}`,
        data: {
          taskId: task.id,
          stakeholderId: task.stakeholderId,
          projectId: task.projectId,
        },
      },
    });

    // Mark reminder as sent
    await db.stakeholderTask.update({
      where: { id: task.id },
      data: { reminderSent: true },
    });

    reminders.push({
      task: task.title,
      stakeholder: task.stakeholder.name,
      notification: notification.id,
    });
  }

  return NextResponse.json({
    success: true,
    remindersSent: reminders.length,
    reminders,
  });
}
