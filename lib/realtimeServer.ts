import Pusher from "pusher";

// Global in-memory event bus for SSE / fallback streaming
type RealtimeEvent = {
  id: string;
  channel: string;
  event: string;
  data: any;
  timestamp: number;
};

declare global {
  var __realtimeEventBus: {
    listeners: Set<(e: RealtimeEvent) => void>;
    recentEvents: RealtimeEvent[];
  } | undefined;
}

if (!globalThis.__realtimeEventBus) {
  globalThis.__realtimeEventBus = {
    listeners: new Set(),
    recentEvents: [],
  };
}

let pusherInstance: Pusher | null = null;
const pusherAppId = process.env.PUSHER_APP_ID;
const pusherKey = process.env.PUSHER_KEY || process.env.NEXT_PUBLIC_PUSHER_KEY;
const pusherSecret = process.env.PUSHER_SECRET;
const pusherCluster = process.env.PUSHER_CLUSTER || process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";

if (pusherAppId && pusherKey && pusherSecret) {
  try {
    pusherInstance = new Pusher({
      appId: pusherAppId,
      key: pusherKey,
      secret: pusherSecret,
      cluster: pusherCluster,
      useTLS: true,
    });
  } catch (err) {
    console.error("Failed to initialize Pusher server instance:", err);
  }
}

export async function triggerRealtimeEvent(channel: string, event: string, data: any) {
  const eventPayload: RealtimeEvent = {
    id: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
    channel,
    event,
    data,
    timestamp: Date.now(),
  };

  // 1. Broadcast to in-memory event bus (for SSE stream & fallback)
  if (globalThis.__realtimeEventBus) {
    globalThis.__realtimeEventBus.recentEvents.push(eventPayload);
    // Keep last 100 events
    if (globalThis.__realtimeEventBus.recentEvents.length > 100) {
      globalThis.__realtimeEventBus.recentEvents.shift();
    }
    for (const listener of globalThis.__realtimeEventBus.listeners) {
      try {
        listener(eventPayload);
      } catch (err) {
        console.error("Error dispatching in-memory event:", err);
      }
    }
  }

  // 2. Broadcast via Pusher if configured
  if (pusherInstance) {
    try {
      await pusherInstance.trigger(channel, event, data);
    } catch (err) {
      console.error(`Pusher trigger failed on channel "${channel}" event "${event}":`, err);
    }
  }

  // 3. Broadcast via Supabase Realtime if configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseKey) {
    try {
      // Supabase Realtime Broadcast endpoint
      const broadcastUrl = `${supabaseUrl}/realtime/v1/api/broadcast`;
      await fetch(broadcastUrl, {
        method: "POST",
        headers: {
          "apikey": supabaseKey,
          "Authorization": `Bearer ${supabaseKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            {
              topic: `realtime:${channel}`,
              event,
              payload: data,
            },
          ],
        }),
      }).catch(() => null);
    } catch {
      // Ignore broadcast errors
    }
  }

  return eventPayload;
}

export function subscribeToInternalBus(listener: (e: RealtimeEvent) => void) {
  if (!globalThis.__realtimeEventBus) return () => {};
  globalThis.__realtimeEventBus.listeners.add(listener);
  return () => {
    globalThis.__realtimeEventBus?.listeners.delete(listener);
  };
}

export function getRecentEvents(channel: string, sinceTimestamp: number = 0) {
  if (!globalThis.__realtimeEventBus) return [];
  return globalThis.__realtimeEventBus.recentEvents.filter(
    (e) => e.channel === channel && e.timestamp > sinceTimestamp
  );
}
