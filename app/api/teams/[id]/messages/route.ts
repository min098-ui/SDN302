import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;

    // Check membership
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    if (team.ownerId !== userId && !membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const messages = await prisma.message.findMany({
      where: { teamId },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
      orderBy: { createdAt: "asc" },
      take: 100,
    });

    return NextResponse.json(messages, { status: 200 });
  } catch (error) {
    console.error("Error fetching messages:", error);
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;

    // Check membership
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    if (team.ownerId !== userId && !membership) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    const { content, fileUrl, fileName } = body;

    if ((!content || typeof content !== "string" || content.trim() === "") && !fileUrl) {
      return NextResponse.json({ error: "Content or file attachment is required" }, { status: 400 });
    }

    const message = await prisma.message.create({
      data: {
        content: content ? content.trim() : "",
        fileUrl: fileUrl || null,
        fileName: fileName || null,
        teamId,
        senderId: userId,
      },
      include: {
        sender: {
          select: { id: true, name: true, email: true },
        },
      },
    });

    // Broadcast real-time message to team channel
    await triggerRealtimeEvent(`team-${teamId}`, "chat:message", message);

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("Error sending message:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}
