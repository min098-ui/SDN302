import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";
import { logActivity } from "@/lib/activityLogger";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = (session!.user as any).id;
    const teamId = (await params).id;

    // Check membership
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: {
        owner: { select: { id: true, name: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, name: true, email: true } },
          },
          orderBy: { joinedAt: "asc" },
        },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, email: true } },
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    if (!membership && team.ownerId !== userId) {
      return NextResponse.json({ error: "Forbidden: You are not a member of this team" }, { status: 403 });
    }

    return NextResponse.json(team, { status: 200 });
  } catch (error) {
    console.error("Error fetching team:", error);
    return NextResponse.json({ error: "Failed to fetch team details" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userName = (session?.user as any)?.name || "User";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    const isOwner = team.ownerId === userId;
    const isAdmin = membership?.role === "ADMIN";

    // Owner and Admin can update team info
    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only Owner and Admins can update team details" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, description } = body;

    const updatedTeam = await prisma.team.update({
      where: { id: teamId },
      data: {
        name: name !== undefined ? name.trim() : undefined,
        description: description !== undefined ? description.trim() : undefined,
      },
    });

    // Broadcast real-time team update
    await triggerRealtimeEvent(`team-${teamId}`, "team:updated", updatedTeam);

    // Log activity
    await logActivity({
      teamId,
      userId,
      action: "TEAM_UPDATED",
      details: `${userName} updated team settings`,
    });

    return NextResponse.json(updatedTeam, { status: 200 });
  } catch (error) {
    console.error("Error updating team:", error);
    return NextResponse.json({ error: "Failed to update team" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // STRICT PERMISSION: Only OWNER can delete the team
    if (team.ownerId !== userId) {
      return NextResponse.json(
        { error: "Forbidden: Only the Team Owner can delete the team" },
        { status: 403 }
      );
    }

    // Broadcast team deletion before removing
    await triggerRealtimeEvent(`team-${teamId}`, "team:deleted", { teamId });

    await prisma.team.delete({
      where: { id: teamId },
    });

    return NextResponse.json({ message: "Team deleted successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error deleting team:", error);
    return NextResponse.json({ error: "Failed to delete team" }, { status: 500 });
  }
}
