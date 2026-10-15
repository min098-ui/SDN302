import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";

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

    const logs = await prisma.activityLog.findMany({
      where: { teamId },
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json(logs, { status: 200 });
  } catch (error) {
    console.error("Error fetching activity logs:", error);
    return NextResponse.json({ error: "Failed to fetch activity logs" }, { status: 500 });
  }
}
