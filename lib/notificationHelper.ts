import prisma from "@/lib/prisma";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";

interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: string;
  link?: string;
}

export async function createNotification({
  userId,
  title,
  message,
  type = "INFO",
  link,
}: CreateNotificationParams) {
  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        link,
      },
    });

    // Broadcast in real-time to user's personal channel
    await triggerRealtimeEvent(`user-${userId}`, "notification:new", notification);
    return notification;
  } catch (error) {
    console.error("Failed to create notification:", error);
    return null;
  }
}
