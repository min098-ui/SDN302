"use client";

import { useEffect, useState } from "react";
import { PlusCircle, CheckCircle2, Pencil, Trash2, UserPlus, ShieldAlert, Settings, Clock, Loader2, Sparkles, Filter } from "lucide-react";
import { useRealtimeSubscription } from "@/lib/realtimeClient";
import { useLanguage } from "@/lib/languageContext";

interface TeamActivityLogProps {
  teamId: string;
}

export default function TeamActivityLog({ teamId }: TeamActivityLogProps) {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const { t } = useLanguage();

  const fetchLogs = async () => {
    try {
      const res = await fetch(`/api/teams/${teamId}/activity`);
      if (res.ok) {
        const data = await res.json();
        setLogs(data);
      }
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) fetchLogs();
  }, [teamId]);

  // Real-time activity updates
  useRealtimeSubscription({
    channel: `team-${teamId}`,
    onEvent: (event, data) => {
      if (event === "activity:new" && data) {
        setLogs((prev) => [data, ...prev]);
      }
    },
  });

  const getActionIcon = (action: string) => {
    switch (action) {
      case "TASK_CREATED":
        return <PlusCircle className="w-4 h-4 text-emerald-500" />;
      case "TASK_STATUS_CHANGED":
        return <CheckCircle2 className="w-4 h-4 text-primary-500" />;
      case "TASK_UPDATED":
        return <Pencil className="w-4 h-4 text-indigo-500" />;
      case "TASK_DELETED":
        return <Trash2 className="w-4 h-4 text-rose-500" />;
      case "MEMBER_ADDED":
        return <UserPlus className="w-4 h-4 text-blue-500" />;
      case "ROLE_UPDATED":
        return <ShieldAlert className="w-4 h-4 text-amber-500" />;
      default:
        return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    if (filter === "ALL") return true;
    if (filter === "TASKS") return log.action.startsWith("TASK_");
    if (filter === "MEMBERS") return log.action.includes("MEMBER") || log.action.includes("ROLE");
    return true;
  });

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200/80 shadow-[0_8px_30px_rgba(0,0,0,0.04)] p-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100">
        <div>
          <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-primary-500" />
            {t("auditTrail")}
          </h3>
          <p className="text-xs font-medium text-slate-500 mt-1">
            Real-time audit log of all changes, assignments, and member management.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {["ALL", "TASKS", "MEMBERS"].map((opt) => (
            <button
              key={opt}
              onClick={() => setFilter(opt)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                filter === opt
                  ? "bg-slate-900 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200/80"
              }`}
            >
              {opt === "ALL" ? "All Activity" : opt === "TASKS" ? "Tasks" : "Members"}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6">
        {isLoading ? (
          <div className="py-16 flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
          </div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400">
            <Clock className="w-10 h-10 mx-auto mb-2 opacity-30" />
            <p className="text-sm font-semibold text-slate-600">No activity recorded yet</p>
            <p className="text-xs text-slate-400 mt-1">Actions performed by team members will appear live here.</p>
          </div>
        ) : (
          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-100">
            {filteredLogs.map((log) => (
              <div key={log.id} className="relative flex items-start gap-4 group">
                <div className="absolute -left-6 top-1 p-1 bg-white rounded-full border border-slate-200/80 shadow-xs">
                  {getActionIcon(log.action)}
                </div>

                <div className="flex-1 bg-slate-50/70 hover:bg-slate-50 p-4 rounded-2xl border border-slate-200/60 transition-all shadow-xs">
                  <div className="flex items-center justify-between gap-2">
                    <p className="text-xs font-extrabold text-slate-900">
                      {log.user?.name || "System"}
                    </p>
                    <span className="text-[10px] font-semibold text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {new Date(log.createdAt).toLocaleDateString()} {new Date(log.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </div>
                  <p className="text-xs font-medium text-slate-600 mt-1">
                    {log.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
