import prisma from "@/lib/prisma";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";

interface LogActivityParams {
  teamId: string;
  userId: string;
  action: string;
  details: string;
}

export async function logActivity({ teamId, userId, action, details }: LogActivityParams) {
  try {
    const activity = await prisma.activityLog.create({
      data: {
        teamId,
        userId,
        action,
        details,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // Broadcast activity in real-time
    await triggerRealtimeEvent(`team-${teamId}`, "activity:new", activity);
    return activity;
  } catch (error) {
    console.error("Failed to log activity:", error);
    return null;
  }
}
