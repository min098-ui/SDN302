"use client";

import { Task } from "@/lib/types";
import { Calendar, Edit3, Trash2, Clock, CheckCircle2, Circle } from "lucide-react";

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
          icon: <CheckCircle2 className="w-3.5 h-3.5" />,
          classes:
            "bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/60",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          icon: <Clock className="w-3.5 h-3.5" />,
          classes:
            "bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/60",
        };
      default:
        return {
          label: "To Do",
          icon: <Circle className="w-3.5 h-3.5" />,
          classes:
            "bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700",
        };
    }
  };

  // Priority style helper
  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return {
          label: "High",
          classes:
            "bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-900/60",
        };
      case "MEDIUM":
        return {
          label: "Medium",
          classes:
            "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-400 border-sky-200 dark:border-sky-900/60",
        };
      default:
        return {
          label: "Low",
          classes:
            "bg-slate-50 dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800",
        };
    }
  };

  const statusBadge = getStatusBadge(task.status);
  const priorityBadge = getPriorityBadge(task.priority);

  return (
    <div className="group relative bg-white dark:bg-slate-900 rounded-2xl p-5 border border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-800 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between">
      <div>
        {/* Top badges & actions */}
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => onToggleStatus(task)}
              title="Click to quickly toggle status"
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border transition-transform active:scale-95 ${statusBadge.classes}`}
            >
              {statusBadge.icon}
              <span>{statusBadge.label}</span>
            </button>

            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-medium border ${priorityBadge.classes}`}
            >
              {priorityBadge.label}
            </span>
          </div>

          {/* Edit / Delete actions */}
          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Edit Task"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Title */}
        <h4
          className={`font-semibold text-base text-slate-900 dark:text-white leading-snug mb-1.5 line-clamp-2 ${
            task.status === "DONE" ? "line-through text-slate-400 dark:text-slate-500" : ""
          }`}
        >
          {task.title}
        </h4>

        {/* Description */}
        {task.description && (
          <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 leading-relaxed mb-4">
            {task.description}
          </p>
        )}
      </div>

      {/* Due date & footer info */}
      <div className="pt-3 mt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          {task.dueDate ? (
            <span>Due {new Date(task.dueDate).toLocaleDateString()}</span>
          ) : (
            <span className="text-slate-400 italic">No due date</span>
          )}
        </div>
        <span className="text-[11px] text-slate-400">
          {new Date(task.createdAt).toLocaleDateString(undefined, {
            month: "short",
            day: "numeric",
          })}
        </span>
      </div>
    </div>
  );
}
