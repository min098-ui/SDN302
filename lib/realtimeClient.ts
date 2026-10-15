"use client";

import { useEffect, useRef, useState } from "react";
import Pusher from "pusher-js";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

interface UseRealtimeOptions {
  channel: string | null | undefined;
  onEvent?: (event: string, data: any) => void;
  enabled?: boolean;
}

let supabaseInstance: SupabaseClient | null = null;
function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseInstance && url && anonKey) {
    try {
      supabaseInstance = createClient(url, anonKey);
    } catch (e) {
      console.warn("Supabase client init failed:", e);
    }
  }
  return supabaseInstance;
}

let pusherClientInstance: Pusher | null = null;
function getPusherClient() {
  const pusherKey = process.env.NEXT_PUBLIC_PUSHER_KEY;
  const cluster = process.env.NEXT_PUBLIC_PUSHER_CLUSTER || "ap1";
  if (!pusherClientInstance && pusherKey) {
    try {
      pusherClientInstance = new Pusher(pusherKey, {
        cluster,
        forceTLS: true,
      });
    } catch (e) {
      console.warn("Pusher client init failed:", e);
    }
  }
  return pusherClientInstance;
}

export function useRealtimeSubscription({ channel, onEvent, enabled = true }: UseRealtimeOptions) {
  const [isConnected, setIsConnected] = useState(false);
  const [provider, setProvider] = useState<"pusher" | "supabase" | "sse" | "poll">("sse");
  const onEventRef = useRef(onEvent);
  useEffect(() => {
    onEventRef.current = onEvent;
  });

  useEffect(() => {
    if (!channel || !enabled) {
      setIsConnected(false);
      return;
    }

    let isSubscribed = true;
    const pusher = getPusherClient();
    const supabase = getSupabaseClient();

    // Provider 1: Pusher
    if (pusher) {
      setProvider("pusher");
      const pusherChannel = pusher.subscribe(channel);
      pusherChannel.bind_global((eventName: string, data: any) => {
        if (!isSubscribed) return;
        if (!eventName.startsWith("pusher:")) {
          onEventRef.current?.(eventName, data);
        }
      });

      pusher.connection.bind("connected", () => {
        if (isSubscribed) setIsConnected(true);
      });
      pusher.connection.bind("disconnected", () => {
        if (isSubscribed) setIsConnected(false);
      });

      if (pusher.connection.state === "connected") {
        setIsConnected(true);
      }

      return () => {
        isSubscribed = false;
        pusher.unsubscribe(channel);
      };
    }

    // Provider 2: Supabase Realtime
    if (supabase) {
      setProvider("supabase");
      const sbChannel = supabase
        .channel(`realtime:${channel}`)
        .on("broadcast", { event: "*" }, (payload: any) => {
          if (!isSubscribed) return;
          onEventRef.current?.(payload.event, payload.payload);
        })
        .subscribe((status: string) => {
          if (isSubscribed) {
            setIsConnected(status === "SUBSCRIBED");
          }
        });

      return () => {
        isSubscribed = false;
        supabase.removeChannel(sbChannel);
      };
    }

    // Provider 3: Server-Sent Events (SSE) with Polling fallback
    setProvider("sse");
    let eventSource: EventSource | null = null;
    let pollInterval: NodeJS.Timeout | null = null;
    let lastTimestamp = Date.now();

    const startPolling = () => {
      setProvider("poll");
      setIsConnected(true);
      if (pollInterval) clearInterval(pollInterval);
      pollInterval = setInterval(async () => {
        if (!isSubscribed) return;
        try {
          const res = await fetch(`/api/realtime/poll?channel=${encodeURIComponent(channel)}&since=${lastTimestamp}`);
          if (res.ok) {
            const data = await res.json();
            if (data.events && Array.isArray(data.events)) {
              for (const ev of data.events) {
                if (ev.timestamp > lastTimestamp) {
                  lastTimestamp = ev.timestamp;
                }
                onEventRef.current?.(ev.event, ev.data);
              }
            }
          }
        } catch {
          // ignore error
        }
      }, 2500);
    };

    if (typeof EventSource !== "undefined") {
      try {
        eventSource = new EventSource(`/api/realtime/sse?channel=${encodeURIComponent(channel)}`);

        eventSource.onopen = () => {
          if (isSubscribed) setIsConnected(true);
        };

        eventSource.onmessage = (event) => {
          if (!isSubscribed) return;
          try {
            const parsed = JSON.parse(event.data);
            onEventRef.current?.("message", parsed);
          } catch {}
        };

        // Listen for custom event types
        const knownEvents = [
          "chat:message",
          "chat:typing",
          "task:created",
          "task:updated",
          "task:deleted",
          "member:added",
          "member:removed",
          "member:role_updated",
          "team:updated",
          "team:deleted",
          "notification:new",
        ];

        knownEvents.forEach((evtName) => {
          eventSource?.addEventListener(evtName, (e: any) => {
            if (!isSubscribed) return;
            try {
              const data = JSON.parse(e.data);
              onEventRef.current?.(evtName, data);
            } catch (err) {
              console.error(`Error parsing SSE event ${evtName}:`, err);
            }
          });
        });

        eventSource.onerror = () => {
          if (isSubscribed) {
            setIsConnected(false);
            // Fallback to polling if SSE has an error
            if (!pollInterval) {
              startPolling();
            }
          }
        };
      } catch {
        startPolling();
      }
    } else {
      startPolling();
    }

    return () => {
      isSubscribed = false;
      if (eventSource) eventSource.close();
      if (pollInterval) clearInterval(pollInterval);
    };
  }, [channel, enabled]);

  return { isConnected, provider };
}
