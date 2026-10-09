import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !(session.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const userId = (session.user as any).id;

    const taskId = (await params).id;
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (task.teamId) {
      const team = await prisma.team.findUnique({ where: { id: task.teamId } });
      const membership = await prisma.teamMember.findUnique({
        where: { teamId_userId: { teamId: task.teamId, userId: userId } },
      });

      if (!membership && team?.ownerId !== userId) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
    }

    const body = await request.json();
    const { title, description, status, priority, dueDate, assigneeId } = body;

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
        assignee: { select: { id: true, name: true } },
      },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error) {
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

    const taskId = (await params).id;
    const task = await prisma.task.findUnique({ where: { id: taskId } });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    let isAllowed = false;

    if (task.assigneeId === userId) {
      isAllowed = true;
    } else if (task.teamId) {
      const team = await prisma.team.findUnique({ where: { id: task.teamId } });
      if (team?.ownerId === userId) {
        isAllowed = true;
      }
    } else {
      isAllowed = true; // Orphan tasks can be deleted
    }

    if (!isAllowed) {
      return NextResponse.json({ error: "Forbidden - Only assignee or team owner can delete" }, { status: 403 });
    }

    await prisma.task.delete({
      where: { id: taskId },
    });

    return NextResponse.json({ message: "Task deleted successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
