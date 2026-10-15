import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";
import { logActivity } from "@/lib/activityLogger";
import { createNotification } from "@/lib/notificationHelper";

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as any)?.id;
    const userName = (session?.user as any)?.name || "Team Admin";

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Role check: Only Owner and Admin can invite/add members
    const membership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId } },
    });

    const isOwner = team.ownerId === userId;
    const isAdmin = membership?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json({ error: "Forbidden: Only Owner and Admins can invite members" }, { status: 403 });
    }

    const body = await request.json();
    const { email, role } = body;

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Only OWNER can assign ADMIN role directly if required, or Admin can assign MEMBER/ADMIN
    const assignedRole = role === "ADMIN" ? "ADMIN" : "MEMBER";

    const targetUser = await prisma.user.findUnique({ where: { email } });
    if (!targetUser) {
      return NextResponse.json({ error: "User not found with this email" }, { status: 404 });
    }

    if (targetUser.id === team.ownerId) {
      return NextResponse.json({ error: "User is the team owner" }, { status: 400 });
    }

    const existingMember = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUser.id } },
    });

    if (existingMember) {
      return NextResponse.json({ error: "User is already a member" }, { status: 400 });
    }

    const newMember = await prisma.teamMember.create({
      data: {
        teamId,
        userId: targetUser.id,
        role: assignedRole,
      },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // 1. Broadcast member:added
    await triggerRealtimeEvent(`team-${teamId}`, "member:added", newMember);

    // 2. Log activity
    await logActivity({
      teamId,
      userId,
      action: "MEMBER_ADDED",
      details: `${userName} invited ${targetUser.name} as ${assignedRole}`,
    });

    // 3. Notify user
    await createNotification({
      userId: targetUser.id,
      title: "Team Invitation",
      message: `${userName} added you to "${team.name}" as ${assignedRole}`,
      type: "TEAM_INVITATION",
      link: `/teams/${teamId}`,
    });

    return NextResponse.json(newMember, { status: 201 });
  } catch (error) {
    console.error("Error adding member:", error);
    return NextResponse.json({ error: "Failed to add member" }, { status: 500 });
  }
}
