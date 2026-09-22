import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// PUT /api/tasks/:id - Update an existing task
export async function PUT(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const body = await request.json();
    const { title, description, status, priority, dueDate } = body;

    // Check if task exists
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    if (title !== undefined && (typeof title !== "string" || title.trim() === "")) {
      return NextResponse.json({ error: "Title cannot be empty" }, { status: 400 });
    }

    const updatedTask = await prisma.task.update({
      where: { id },
      data: {
        ...(title !== undefined && { title: title.trim() }),
        ...(description !== undefined && {
          description: description ? description.trim() : null,
        }),
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate) : null,
        }),
      },
    });

    return NextResponse.json(updatedTask, { status: 200 });
  } catch (error: unknown) {
    console.error("Error updating task:", error);
    return NextResponse.json({ error: "Failed to update task" }, { status: 500 });
  }
}

// DELETE /api/tasks/:id - Delete a task
export async function DELETE(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;

    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({ message: "Task deleted successfully", id }, { status: 200 });
  } catch (error: unknown) {
    console.error("Error deleting task:", error);
    return NextResponse.json({ error: "Failed to delete task" }, { status: 500 });
  }
}
