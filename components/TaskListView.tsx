"use client";

import { Task } from "@/lib/types";
import { Calendar, Edit3, Trash2, Check } from "lucide-react";

interface TaskListViewProps {
  tasks: Task[];
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
}

export default function TaskListView({
  tasks,
  onEdit,
  onDelete,
  onToggleStatus,
}: TaskListViewProps) {
  const getStatusBadge = (status: Task["status"]) => {
    switch (status) {
      case "DONE":
        return {
          label: "DONE",
          classes: "bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold",
        };
      case "IN_PROGRESS":
        return {
          label: "IN PROGRESS",
          classes: "bg-secondary-50 text-secondary-700 border border-secondary-200 font-bold",
        };
      default:
        return {
          label: "TO DO",
          classes: "bg-slate-50 text-slate-600 border border-slate-200 font-bold",
        };
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return {
          label: "HIGH",
          classes: "bg-gradient-to-r from-rose-50 to-pink-50 text-rose-700 border border-rose-200 font-bold",
        };
      case "MEDIUM":
        return {
          label: "MEDIUM",
          classes: "bg-gradient-to-r from-amber-50 to-orange-50 text-amber-800 border border-amber-200 font-bold",
        };
      default:
        return {
          label: "LOW",
          classes: "bg-slate-50 text-slate-600 border border-slate-200 font-bold",
        };
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map((task) => {
        const statusBadge = getStatusBadge(task.status);
        const priorityBadge = getPriorityBadge(task.priority);
        const isOverdue =
          task.dueDate &&
          task.status !== "DONE" &&
          new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));
        const isDone = task.status === "DONE";

        return (
          <div
            key={task.id}
            className={`bg-white rounded-xl border p-4 transition-colors ${
              isDone ? "border-slate-200/60 opacity-75" : "border-slate-200 hover:border-slate-300"
            }`}
          >
            <div className="flex items-start gap-4">
              {/* Checkbox */}
              <button
                onClick={() => onToggleStatus(task)}
                className={`w-6 h-6 rounded-[6px] border flex-shrink-0 mt-0.5 flex items-center justify-center transition-colors shadow-2xs ${
                  isDone
                    ? "bg-primary-500 border-primary-500 text-white"
                    : "border-slate-300 hover:border-primary-400 bg-white"
                }`}
                title="Toggle status"
              >
                {isDone && <Check className="w-4 h-4" />}
              </button>

              {/* Main Content Area */}
              <div className="flex-1 min-w-0">
                {/* Top Row: Title, Status, Actions */}
                <div className="flex items-start justify-between gap-4 mb-1.5">
                  <div className="flex items-center gap-3 flex-wrap">
                    <h3
                      className={`text-[17px] font-extrabold tracking-tight ${
                        isDone ? "text-slate-400 line-through" : "text-slate-800"
                      }`}
                    >
                      {task.title}
                    </h3>
                    <span
                      className={`text-[9px] uppercase px-2 py-0.5 rounded-md ${statusBadge.classes}`}
                    >
                      {statusBadge.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-slate-300">
                    <button
                      onClick={() => onEdit(task)}
                      className="hover:text-slate-600 transition-colors p-1"
                      title="Edit"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onDelete(task.id)}
                      className="hover:text-rose-600 transition-colors p-1"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Middle Row: Priority */}
                <div className="mb-2.5">
                  <span
                    className={`text-[10px] uppercase px-2 py-0.5 rounded-md ${priorityBadge.classes}`}
                  >
                    {priorityBadge.label}
                  </span>
                </div>

                {/* Description */}
                {task.description && (
                  <p className="text-[13px] text-slate-600 mb-3.5 font-medium">{task.description}</p>
                )}

                {/* Footer */}
                <div className="flex items-center gap-4 text-xs text-slate-500">
                  <div
                    className={`flex items-center gap-1.5 font-semibold ${
                      isDone
                        ? "text-slate-400"
                        : isOverdue
                        ? "text-rose-700"
                        : "text-slate-700"
                    }`}
                  >
                    <Calendar className="w-3.5 h-3.5 text-primary-500" />
                    {task.dueDate ? (
                      <span suppressHydrationWarning>
                        Due {new Date(task.dueDate).toLocaleDateString()}
                      </span>
                    ) : (
                      <span className="italic font-normal">No deadline</span>
                    )}
                  </div>
                  <span suppressHydrationWarning className="font-medium text-slate-400">
                    Created {new Date(task.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
