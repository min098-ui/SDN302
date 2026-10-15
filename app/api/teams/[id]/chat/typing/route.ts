import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/authOptions";
import { triggerRealtimeEvent } from "@/lib/realtimeServer";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    const user = session?.user as any;
    if (!user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const teamId = (await params).id;
    const body = await request.json().catch(() => ({}));
    const isTyping = body.isTyping !== false;

    // Broadcast typing event without database storage
    await triggerRealtimeEvent(`team-${teamId}`, "chat:typing", {
      userId: user.id,
      userName: user.name || "Member",
      isTyping,
      timestamp: Date.now(),
    });

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: "Failed to broadcast typing" }, { status: 500 });
  }
}
