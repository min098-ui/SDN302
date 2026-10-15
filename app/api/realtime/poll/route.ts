import { NextResponse } from "next/server";
import { getRecentEvents } from "@/lib/realtimeServer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channel = url.searchParams.get("channel");
  const since = parseInt(url.searchParams.get("since") || "0", 10);

  if (!channel) {
    return NextResponse.json({ error: "Missing channel" }, { status: 400 });
  }

  const events = getRecentEvents(channel, since);
  return NextResponse.json({
    events,
    timestamp: Date.now(),
  });
}
