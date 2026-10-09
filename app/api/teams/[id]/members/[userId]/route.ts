import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, userId: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!(session?.user as any)?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    const targetUserId = (await params).userId;
    
    const team = await prisma.team.findUnique({ where: { id: teamId } });

    if (!team) {
      return NextResponse.json({ error: "Team not found" }, { status: 404 });
    }

    // Only owner can remove members (or a member can remove themselves)
    if (team.ownerId !== (session!.user as any).id && (session!.user as any).id !== targetUserId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Owner cannot remove themselves this way
    if (team.ownerId === targetUserId) {
      return NextResponse.json({ error: "Owner cannot be removed" }, { status: 400 });
    }

    await prisma.teamMember.delete({
      where: { teamId_userId: { teamId, userId: targetUserId } },
    });

    return NextResponse.json({ message: "Member removed successfully" }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to remove member" }, { status: 500 });
  }
}
