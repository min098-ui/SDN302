import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";
import { logActivity } from "@/lib/activityLogger";
import { createNotification } from "@/lib/notificationHelper";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const userName = (session.user as any).name || "User";

    const taskId = (await params).id;
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, assigneeId } = body;

    // Advanced Role & Permission Check
    if (task.teamId) {
      const team = await prisma.team.findUnique({ where: { id: task.teamId } });
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: task.teamId, userId } },
      });

      if (!team || (!membership && team.ownerId !== userId)) {
        return NextResponse.json({ error: "Forbidden: Not a team member" }, { status: 403 });
      }

      const isOwner = team.ownerId === userId;
      const isAdmin = membership?.role === "ADMIN";
      const isMember = !isOwner && !isAdmin;

      // MEMBER restrictions:
      // Members can only edit tasks assigned to them, or update task status, or unassigned tasks
      if (isMember) {
        const isAssignee = task.assigneeId === userId;
        const isOnlyStatusChange =
          status !== undefined &&
          title === undefined &&
          description === undefined &&
          priority === undefined &&
          assigneeId === undefined &&
          dueDate === undefined;

        if (!isAssignee && !isOnlyStatusChange && task.assigneeId !== null) {
          return NextResponse.json(
            { error: "Forbidden: Members can only manage their own tasks or update progress" },
            { status: 403 }
          );
        }
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: title !== undefined ? title.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
        status: status,
        priority: priority,
        dueDate: dueDate ? new Date(dueDate) : dueDate === null ? null : undefined,
        assigneeId: assigneeId !== undefined ? assigneeId : undefined,
      },
      include: {
        assignee: { select: { id: true, name: true, email: true } },
      },
    });

    // Real-time broadcast and activity logging
    if (task.teamId) {
      await triggerRealtimeEvent(`team-${task.teamId}`, "task:updated", updatedTask);

      if (status !== undefined && status !== task.status) {
        await logActivity({
          teamId: task.teamId,
          userId,
          action: "TASK_STATUS_CHANGED",
          details: `${userName} moved task "${updatedTask.title}" to ${updatedTask.status}`,
        });
      } else {
        await logActivity({
          teamId: task.teamId,
          userId,
          action: "TASK_UPDATED",
          details: `${userName} updated task "${updatedTask.title}"`,
        });
      }

      // Check for new assignee notification
      if (
        updatedTask.assigneeId &&
        updatedTask.assigneeId !== task.assigneeId &&
        updatedTask.assigneeId !== userId
      ) {
        await createNotification({
          userId: updatedTask.assigneeId,
          title: "Task Assigned",
          message: `${userName} assigned you to task "${updatedTask.title}"`,
          type: "TASK_ASSIGNED",
          link: `/teams/${task.teamId}`,
        });
      }
    }

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;
    const userName = (session.user as any).name || "User";

    const taskId = (await params).id;
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let isAllowed = false;

    if (task.teamId) {
      const team = await prisma.team.findUnique({ where: { id: task.teamId } });
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: task.teamId, userId } },
      });

      if (!team || (!membership && team.ownerId !== userId)) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }

      const isOwner = team.ownerId === userId;
      const isAdmin = membership?.role === "ADMIN";
      const isAssignee = task.assigneeId === userId;

      // OWNER and ADMIN can delete any task. MEMBER can only delete their assigned task.
      if (isOwner || isAdmin || isAssignee) {
        isAllowed = true;
      }
    } else {
      isAllowed = true; // Orphan tasks can be deleted by caller
    }

    if (!isAllowed) {
      return NextResponse.json(
        { error: "Forbidden: Only Owner, Admin, or the task Assignee can delete this task" },
        { status: 403 }
      );
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    if (task.teamId) {
      await triggerRealtimeEvent(`team-${task.teamId}`, "task:deleted", {
        taskId,
        title: task.title,
      });

      await logActivity({
        teamId: task.teamId,
        userId,
        action: "TASK_DELETED",
        details: `${userName} deleted task "${task.title}"`,
      });
    }

    return NextResponse.json({ message: "Task deleted successfully", taskId }, { status: 200 });
  } catch (error) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
