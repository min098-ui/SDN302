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
          dotColor: "bg-secondary-500",
          accentLine: "card-accent-todo",
          cardBorder: "hover:border-secondary-400 hover:shadow-secondary-500/15",
          icon: <Circle className="w-3.5 h-3.5 text-secondary-500" />,
          classes:
            "bg-secondary-50 text-secondary-700 border-secondary-200 hover:bg-secondary-100 shadow-2xs",
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
      className={`group relative bg-white/85 backdrop-blur-xl rounded-xl border border-white/80 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1 flex flex-col justify-between overflow-hidden ${statusBadge.cardBorder}`}
    >
      {/* Top Colorful Accent Line */}
      <div className={`h-1 w-full ${statusBadge.accentLine}`} />

      <div className="p-3.5 sm:p-4">
        {/* Top badges & actions */}
        <div className="flex items-start justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 flex-wrap">
            <button
              onClick={() => onToggleStatus(task)}
              title="Click to advance status"
              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all active:scale-95 ${statusBadge.classes}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${statusBadge.dotColor}`} />
              <span>{statusBadge.label}</span>
            </button>

            <span
              className={`inline-flex items-center px-1.5 py-0.5 rounded-md text-[9px] border ${priorityBadge.classes}`}
            >
              {priorityBadge.label}
            </span>

            {isOverdue && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md text-[9px] font-bold bg-rose-50 text-rose-700 border border-rose-300 animate-pulse shadow-2xs">
                <AlertCircle className="w-2.5 h-2.5 text-rose-600" />
                Overdue
              </span>
            )}
          </div>

          {/* Edit / Delete actions */}
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity -mt-1 -mr-1">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-3 h-3" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4
          className={`font-bold text-sm leading-snug mb-1.5 transition-colors line-clamp-2 ${
            task.status === "DONE"
              ? "line-through text-slate-400"
              : "text-slate-800 group-hover:text-slate-900"
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed mb-2 font-normal">
            {task.description}
          </p>
        )}
      </div>

      {/* Due date & footer info */}
      <div className="px-3.5 py-2 border-t border-slate-100/90 bg-slate-50/60 flex items-center justify-between text-[10px] text-slate-500 mt-auto">
        <div className="flex items-center gap-1">
          <Calendar className="w-3 h-3" style={{ color: isOverdue ? "#f43f5e" : "var(--accent-color)" }} />
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
        <span suppressHydrationWarning className="text-[9px] text-slate-400 font-mono">
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
