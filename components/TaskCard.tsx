"use client";

import { Task } from "@/lib/types";
import { Calendar, Edit3, Trash2, Clock, CheckCircle2, Circle, AlertCircle } from "lucide-react";

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

export default function TaskCard({ task, onEdit, onDelete, onToggleStatus }: TaskCardProps) {
  // Status style helper
  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "DONE":
        return {
          label: "Done",
          dotColor: "bg-emerald-500",
          accentLine: "card-accent-done",
          cardBorder: "hover:border-emerald-400 hover:shadow-emerald-500/15",
          icon: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />,
          classes:
            "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          dotColor: "bg-amber-500 animate-pulse",
          accentLine: "card-accent-in-progress",
          cardBorder: "hover:border-amber-400 hover:shadow-amber-500/15",
          icon: <Clock className="w-3.5 h-3.5 text-amber-600" />,
          classes:
            "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100 shadow-2xs",
        };
      default:
        return {
          label: "To Do",
          dotColor: "bg-purple-500",
          accentLine: "card-accent-todo",
          cardBorder: "hover:border-purple-400 hover:shadow-purple-500/15",
          icon: <Circle className="w-3.5 h-3.5 text-purple-500" />,
          classes:
            "bg-purple-50 text-purple-700 border-purple-200 hover:bg-purple-100 shadow-2xs",
        };
    }
  };

  // Priority style helper
  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return {
          label: "High Priority",
          classes:
            "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border-rose-200 font-bold shadow-2xs",
        };
      case "MEDIUM":
        return {
          label: "Medium",
          classes:
            "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border-amber-200 font-semibold shadow-2xs",
        };
      default:
        return {
          label: "Low",
          classes:
            "bg-slate-50 text-slate-600 border-slate-200 font-medium",
        };
    }
  };

  // Due date status
  const isOverdue =
    task.dueDate && task.status !== "DONE" && new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

  const statusBadge = getStatusBadge(task.status);
  const priorityBadge = getPriorityBadge(task.priority);

  return (
    <div
      className={`group relative bg-white/85 backdrop-blur-xl rounded-2xl border border-white/80 shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${statusBadge.cardBorder}`}
    >
      {/* Top Colorful Accent Line */}
      <div className={`h-1.5 w-full ${statusBadge.accentLine}`} />

      <div className="p-5">
        {/* Top badges & actions */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onToggleStatus(task)}
              title="Click to advance status"
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border transition-all active:scale-95 ${statusBadge.classes}`}
            >
              <span className={`w-2 h-2 rounded-full ${statusBadge.dotColor}`} />
              <span>{statusBadge.label}</span>
            </button>

            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${priorityBadge.classes}`}
            >
              {priorityBadge.label}
            </span>

            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse shadow-2xs">
                <AlertCircle className="w-3 h-3 text-rose-600" />
                Overdue
              </span>
            )}
          </div>

          {/* Edit / Delete actions */}
          <div className="flex items-center gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4
          className={`font-bold text-base leading-snug mb-2 transition-colors ${
            task.status === "DONE"
              ? "line-through text-slate-400"
              : "text-slate-900 group-hover:opacity-75"
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-4 font-normal">
            {task.description}
          </p>
        )}
      </div>

      {/* Due date & footer info */}
      <div className="px-5 py-3 border-t border-slate-100/90 bg-slate-50/60 flex items-center justify-between text-xs text-slate-500">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5" style={{ color: isOverdue ? "#f43f5e" : "var(--accent-color)" }} />
          {task.dueDate ? (
            <span
              suppressHydrationWarning
              className={`font-semibold ${
                isOverdue ? "text-rose-600" : "text-slate-700"
              }`}
            >
              Due {new Date(task.dueDate).toLocaleDateString()}
            </span>
          ) : (
            <span className="text-slate-400 italic">No deadline</span>
          )}
        </div>
        <span suppressHydrationWarning className="text-[11px] text-slate-400 font-mono">
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
