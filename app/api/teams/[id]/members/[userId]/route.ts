import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";
import { logActivity } from "@/lib/activityLogger";
import { createNotification } from "@/lib/notificationHelper";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;
    const currentUserName = (session?.user as any)?.name || "Admin";

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    const targetUserId = (await params).userId;

    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Determine current user's role
    const isOwner = team.ownerId === currentUserId;
    const currentMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: currentUserId } },
    });
    const isAdmin = currentMembership?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return NextResponse.json(
        { error: "Forbidden: Only Owner and Admins can update roles" },
        { status: 403 }
      );
    }

    // Owner cannot be changed via member role update
    if (targetUserId === team.ownerId) {
      return NextResponse.json(
        { error: "Cannot change the role of the team Owner" },
        { status: 400 }
      );
    }

    const targetMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUserId } },
      include: { user: { select: { id: true, name: true, email: true } } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found in team" }, { status: 404 });
    }

    // Admins cannot change other Admins' roles (only Owner can)
    if (isAdmin && !isOwner && targetMembership.role === "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden: Only Owner can manage Admin roles" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { role } = body;

    if (!role || !["ADMIN", "MEMBER"].includes(role)) {
      return NextResponse.json(
        { error: "Invalid role. Must be ADMIN or MEMBER" },
        { status: 400 }
      );
    }

    const updatedMember = await prisma.teamMember.update({
      where: { teamId_userId: { teamId, userId: targetUserId } },
      data: { role },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    });

    // 1. Broadcast real-time role update
    await triggerRealtimeEvent(`team-${teamId}`, "member:role_updated", updatedMember);

    // 2. Log activity
    await logActivity({
      teamId,
      userId: currentUserId,
      action: "ROLE_UPDATED",
      details: `${currentUserName} changed ${targetMembership.user.name}'s role to ${role}`,
    });

    // 3. Notify the affected member
    await createNotification({
      userId: targetUserId,
      title: "Role Updated",
      message: `Your role in "${team.name}" was changed to ${role}`,
      type: "ROLE_UPDATED",
      link: `/teams/${teamId}`,
    });

    return NextResponse.json(updatedMember, { status: 200 });
  } catch (error) {
    console.error("Error updating member role:", error);
    return NextResponse.json({ error: "Failed to update member role" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string; userId: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as any)?.id;
    const currentUserName = (session?.user as any)?.name || "Member";

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    const targetUserId = (await params).userId;
    
    const team = await prisma.team.findUnique({ where: { id: teamId } });
    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Owner cannot be removed
    if (team.ownerId === targetUserId) {
      return NextResponse.json({ error: "Owner cannot be removed" }, { status: 400 });
    }

    const isOwner = team.ownerId === currentUserId;
    const isSelf = currentUserId === targetUserId;

    const currentMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: currentUserId } },
    });
    const isAdmin = currentMembership?.role === "ADMIN";

    const targetMembership = await prisma.teamMember.findUnique({
      where: { teamId_userId: { teamId, userId: targetUserId } },
      include: { user: { select: { id: true, name: true } } },
    });

    if (!targetMembership) {
      return NextResponse.json({ error: "Member not found" }, { status: 404 });
    }

    // Role checks for removal:
    // - Owner can remove anyone except self
    // - Self can always leave
    // - Admin can remove MEMBERs, but NOT other Admins or Owner
    if (!isOwner && !isSelf) {
      if (!isAdmin) {
        return NextResponse.json({ error: "Forbidden" }, { status: 403 });
      }
      if (targetMembership.role === "ADMIN") {
        return NextResponse.json(
          { error: "Forbidden: Admins cannot remove other Admins" },
          { status: 403 }
        );
      }
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });

    // 1. Broadcast member removal
    await triggerRealtimeEvent(`team-${teamId}`, "member:removed", {
      userId: targetUserId,
      name: targetMembership.user.name,
    });

    // 2. Log activity
    await logActivity({
      teamId,
      userId: currentUserId,
      action: "MEMBER_REMOVED",
      details: isSelf
        ? `${currentUserName} left the team`
        : `${currentUserName} removed ${targetMembership.user.name} from the team`,
    });

    // 3. Notify user if removed by someone else
    if (!isSelf) {
      await createNotification({
        userId: targetUserId,
        title: "Removed from Team",
        message: `You were removed from "${team.name}" by ${currentUserName}`,
        type: "TEAM_REMOVED",
      });
    }

    return NextResponse.json({ message: "Member removed successfully" }, { status: 200 });
  } catch (error) {
    console.error("Error removing member:", error);
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
