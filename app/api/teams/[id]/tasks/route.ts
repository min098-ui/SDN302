import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";
import { logActivity } from "@/lib/activityLogger";
import { createNotification } from "@/lib/notificationHelper";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    
    // Auth check
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: (session!.user as any).id } },
    });
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!membership && team?.ownerId !== (session!.user as any).id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const tasks = await prisma.task.findMany({
      where: { teamId },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch tasks" }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    const userId = (session!.user as any).id;
    const userName = (session!.user as any).name || "Team Member";

    // Auth check
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!membership && team?.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, assigneeId } = body;

    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        teamId,
        assigneeId: assigneeId || null,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    // 1. Broadcast real-time task creation
    await triggerRealtimeEvent(`team-${teamId}`, "task:created", newTask);

    // 2. Log activity
    await logActivity({
      teamId,
      userId,
      action: "TASK_CREATED",
      details: `${userName} created task "${newTask.title}"`,
    });

    // 3. Notify assignee if assigned to someone else
    if (newTask.assigneeId && newTask.assigneeId !== userId) {
      await createNotification({
        userId: newTask.assigneeId,
        title: "New Task Assigned",
        message: `${userName} assigned you to task "${newTask.title}" in ${team?.name || "team"}`,
        type: "TASK_ASSIGNED",
        link: `/teams/${teamId}`,
      });
    }

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
