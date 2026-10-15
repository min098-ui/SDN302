import { subscribeToInternalBus, getRecentEvents } from "@/lib/realtimeServer";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const channel = url.searchParams.get("channel");

  if (!channel) {
    return new Response("Missing channel parameter", { status: 400 });
  }

  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        encoder.encode(`event: connected\ndata: ${JSON.stringify({ channel, time: Date.now() })}\n\n`)
      );

      // Stream any recent events in the last 5 seconds to ensure none were missed
      const recent = getRecentEvents(channel, Date.now() - 5000);
      for (const ev of recent) {
        controller.enqueue(
          encoder.encode(`event: ${ev.event}\ndata: ${JSON.stringify(ev.data)}\n\n`)
        );
      }

      // Subscribe to real-time events
      const unsubscribe = subscribeToInternalBus((ev) => {
        if (ev.channel === channel || ev.channel === "*") {
          try {
            controller.enqueue(
              encoder.encode(`event: ${ev.event}\ndata: ${JSON.stringify(ev.data)}\n\n`)
            );
          } catch {
            // Stream might be closed
          }
        }
      });

      // Heartbeat every 20s
      const heartbeat = setInterval(() => {
        try {
          controller.enqueue(encoder.encode(`event: ping\ndata: {}\n\n`));
        } catch {
          clearInterval(heartbeat);
          unsubscribe();
        }
      }, 20000);

      request.signal.addEventListener("abort", () => {
        clearInterval(heartbeat);
        unsubscribe();
        try {
          controller.close();
        } catch {}
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      "Connection": "keep-alive",
    },
  });
}
