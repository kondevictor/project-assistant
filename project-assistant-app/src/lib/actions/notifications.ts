"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { db } from "@/lib/db";

const NotificationSchema = z.object({
  userId: z.string().min(1, "User ID is required"),
  type: z.enum(["email", "in_app", "push"]),
  title: z.string().min(1, "Title is required"),
  message: z.string().min(1, "Message is required"),
  data: z.any().optional(),
});

export type NotificationInput = z.infer<typeof NotificationSchema>;

export async function createNotification(input: NotificationInput) {
  const validated = NotificationSchema.parse(input);
  const notification = await db.notification.create({
    data: validated,
  });
  return notification;
}

export async function markNotificationRead(id: string) {
  const notification = await db.notification.update({
    where: { id },
    data: { read: true },
  });
  return notification;
}

export async function markAllNotificationsRead(userId: string) {
  await db.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
  revalidatePath("/notifications");
}

export async function getNotificationsByUser(userId: string, limit = 50) {
  return db.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getUnreadCount(userId: string) {
  return db.notification.count({
    where: { userId, read: false },
  });
}

export async function deleteNotification(id: string) {
  await db.notification.delete({
    where: { id },
  });
}
