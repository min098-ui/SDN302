"use client";

import { useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Bell, CheckCheck, Trash2, CheckCircle, UserPlus, ShieldAlert, Sparkles, X, ExternalLink } from "lucide-react";
import toast from "react-hot-toast";
import { useRealtimeSubscription } from "@/lib/realtimeClient";
import { useLanguage } from "@/lib/languageContext";

export default function NotificationBell() {
  const { data: session } = useSession();
  const router = useRouter();
  const { t } = useLanguage();
  const userId = (session?.user as any)?.id;

  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [browserPermission, setBrowserPermission] = useState<NotificationPermission>("default");
  const dropdownRef = useRef<HTMLDivElement>(null);
  const prevUnreadRef = useRef<number>(0);
  const prevNotifIdsRef = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (typeof window !== "undefined" && "Notification" in window) {
      setBrowserPermission(Notification.permission);
    }
  }, []);

  const fetchNotifications = async (isPolling = false) => {
    if (!userId) return;
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        const newNotifs: any[] = data.notifications || [];
        const newUnread: number = data.unreadCount || 0;

        if (isPolling) {
          // Detect newly created notifications since last poll
          const currentIds = new Set(newNotifs.map((n: any) => n.id));
          const brandNew = newNotifs.filter(
            (n: any) => !prevNotifIdsRef.current.has(n.id) && !n.isRead
          );

          if (brandNew.length > 0) {
            // Show toast for each new notification
            brandNew.forEach((notif: any) => {
              toast.custom(
                (tToast) => (
                  <div
                    className={`${
                      tToast.visible ? "animate-enter" : "animate-leave"
                    } max-w-md w-full bg-white shadow-xl rounded-2xl pointer-events-auto flex ring-1 ring-black/5 p-4 border border-primary-200`}
                  >
                    <div className="flex-1 w-0">
                      <div className="flex items-start">
                        <div className="flex-shrink-0 pt-0.5">
                          <div className="w-9 h-9 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center font-bold">
                            <Bell className="w-5 h-5 animate-bounce" />
                          </div>
                        </div>
                        <div className="ml-3 flex-1">
                          <p className="text-sm font-black text-slate-900">{notif.title}</p>
                          <p className="mt-1 text-xs font-medium text-slate-600">{notif.message}</p>
                        </div>
                      </div>
                    </div>
                    <div className="flex border-l border-slate-100 pl-3">
                      <button
                        onClick={() => toast.dismiss(tToast.id)}
                        className="w-full border border-transparent rounded-none rounded-r-lg p-1 flex items-center justify-center text-xs font-bold text-slate-400 hover:text-slate-600"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ),
                { duration: 5000 }
              );

              // Browser push notification
              if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
                try {
                  new Notification(notif.title, {
                    body: notif.message,
                    icon: "/favicon.ico",
                  });
                } catch {}
              }
            });
          }

          prevNotifIdsRef.current = currentIds;
        } else {
          // First load — seed the known IDs without showing toasts
          prevNotifIdsRef.current = new Set(newNotifs.map((n: any) => n.id));
        }

        prevUnreadRef.current = newUnread;
        setNotifications(newNotifs);
        setUnreadCount(newUnread);
      }
    } catch {
      // ignore network errors
    }
  };

  // Initial fetch
  useEffect(() => {
    if (userId) {
      fetchNotifications(false);
    }
  }, [userId]);

  // Polling every 10 seconds as the reliable mechanism
  useEffect(() => {
    if (!userId) return;
    const interval = setInterval(() => {
      fetchNotifications(true);
    }, 10000);
    return () => clearInterval(interval);
  }, [userId]);

  // Real-time subscription (bonus — works if Pusher/SSE available)
  useRealtimeSubscription({
    channel: userId ? `user-${userId}` : null,
    onEvent: (event, data) => {
      if (event === "notification:new" && data) {
        // Avoid duplicate with polling: only add if not already in list
        setNotifications((prev) => {
          if (prev.find((n) => n.id === data.id)) return prev;
          prevNotifIdsRef.current.add(data.id);
          return [data, ...prev];
        });
        setUnreadCount((c) => c + 1);
      }
    },
  });

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      if (res.ok) {
        setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
        setUnreadCount(0);
        toast.success("All marked as read");
      }
    } catch {
      toast.error("Failed to mark all as read");
    }
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      try {
        await fetch("/api/notifications", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ notificationId: notif.id }),
        });
        setNotifications((prev) =>
          prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
        );
        setUnreadCount((c) => Math.max(0, c - 1));
      } catch {}
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const handleDeleteNotification = async (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    try {
      const res = await fetch(`/api/notifications?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        const deleted = notifications.find((n) => n.id === id);
        if (deleted && !deleted.isRead) {
          setUnreadCount((c) => Math.max(0, c - 1));
        }
        setNotifications((prev) => prev.filter((n) => n.id !== id));
      }
    } catch {}
  };

  const requestBrowserPermission = async () => {
    if (typeof window !== "undefined" && "Notification" in window) {
      const perm = await Notification.requestPermission();
      setBrowserPermission(perm);
      if (perm === "granted") {
        toast.success("Browser notifications enabled!");
      }
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case "TASK_ASSIGNED":
        return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case "TEAM_INVITATION":
        return <UserPlus className="w-4 h-4 text-indigo-500" />;
      case "ROLE_UPDATED":
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-primary-500" />;
    }
  };

  if (!userId) return null;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2.5 rounded-xl border border-slate-200/80 bg-white hover:bg-slate-50 text-slate-600 hover:text-slate-900 transition-all shadow-xs flex items-center justify-center active:scale-95"
        title="Notifications"
      >
        <Bell className="w-4.5 h-4.5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-black text-white shadow-sm ring-2 ring-white animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-3xl bg-white p-4 shadow-2xl ring-1 ring-slate-900/10 z-[100] border border-slate-100 animate-in fade-in-50 zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100 px-1">
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-slate-900 text-sm">{t("notifications")}</h4>
              {unreadCount > 0 && (
                <span className="bg-primary-50 text-primary-600 text-[11px] font-bold px-2 py-0.5 rounded-full">
                  {unreadCount} new
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 hover:underline cursor-pointer"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                {t("markAllRead")}
              </button>
            )}
          </div>

          {/* Browser notification prompt banner */}
          {browserPermission === "default" && (
            <div className="mt-3 p-2.5 bg-primary-50/70 border border-primary-200/60 rounded-2xl flex items-center justify-between gap-2">
              <p className="text-[11px] font-semibold text-primary-800">
                Receive instant desktop alerts?
              </p>
              <button
                onClick={requestBrowserPermission}
                className="px-2.5 py-1 bg-primary-600 text-white rounded-xl text-[10px] font-bold hover:bg-primary-700 shadow-xs shrink-0 cursor-pointer"
              >
                Enable
              </button>
            </div>
          )}

          {/* List of notifications */}
          <div className="mt-3 max-h-80 overflow-y-auto space-y-2 pr-1 divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="py-8 text-center text-slate-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-xs font-semibold">{t("noNotifications")}</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <div
                  key={notif.id}
                  onClick={() => handleNotificationClick(notif)}
                  className={`group relative flex items-start gap-3 p-3 rounded-2xl cursor-pointer transition-all pt-3 ${
                    notif.isRead
                      ? "hover:bg-slate-50 opacity-80"
                      : "bg-primary-50/40 hover:bg-primary-50/70 border-l-4 border-primary-500"
                  }`}
                >
                  <div className="p-2 rounded-xl bg-white border border-slate-200/60 shadow-xs shrink-0 mt-0.5">
                    {getIcon(notif.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-slate-900 leading-tight">
                      {notif.title}
                    </p>
                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-2 leading-relaxed">
                      {notif.message}
                    </p>
                    <p className="text-[9px] font-bold text-slate-400 mt-1">
                      {new Date(notif.createdAt).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  <button
                    onClick={(e) => handleDeleteNotification(e, notif.id)}
                    className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-300 hover:text-rose-500 hover:bg-white transition-all shadow-xs"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
