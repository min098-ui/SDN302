import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/tasks - List all tasks
export async function GET() {
  try {
    const tasks = await prisma.task.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(tasks, { status: 200 });
  } catch (error: unknown) {
    console.error("Error fetching tasks:", error);
    return NextResponse.json({ error: "Failed to fetch tasks from database" }, { status: 500 });
  }
}

// POST /api/tasks - Create a new task
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, status, priority, dueDate } = body;

    // Validation: Title is required
    if (!title || typeof title !== "string" || title.trim() === "") {
      return NextResponse.json(
        { error: "Title is required and must not be empty" },
        { status: 400 }
      );
    }

    const newTask = await prisma.task.create({
      data: {
        title: title.trim(),
        description: description ? description.trim() : null,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
      },
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error: unknown) {
    console.error("Error creating task:", error);
    return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
  }
}
