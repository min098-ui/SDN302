"use client";

import { Task } from "@/lib/types";
import { Calendar, Edit3, Trash2, Clock, CheckCircle2, Circle } from "lucide-react";

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
          label: "Done",
          dotColor: "bg-emerald-500",
          icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
          classes: "bg-emerald-50 text-emerald-700 border-emerald-200",
        };
      case "IN_PROGRESS":
        return {
          label: "In Progress",
          dotColor: "bg-cyan-500 animate-pulse",
          icon: <Clock className="w-4 h-4 text-sky-600" />,
          classes: "bg-sky-50 text-sky-700 border-sky-200",
        };
      default:
        return {
          label: "To Do",
          dotColor: "bg-indigo-500",
          icon: <Circle className="w-4 h-4 text-indigo-500" />,
          classes: "bg-indigo-50 text-indigo-700 border-indigo-200",
        };
    }
  };

  const getPriorityBadge = (priority: Task["priority"]) => {
    switch (priority) {
      case "HIGH":
        return {
          label: "High Priority",
          classes: "bg-rose-50 text-rose-700 border-rose-200 font-bold",
        };
      case "MEDIUM":
        return {
          label: "Medium",
          classes: "bg-amber-50 text-amber-800 border-amber-200 font-semibold",
        };
      default:
        return {
          label: "Low",
          classes: "bg-slate-50 text-slate-600 border-slate-200 font-medium",
        };
    }
  };

  return (
    <div className="bg-white/85 backdrop-blur-xl border border-white/80 rounded-2xl overflow-hidden shadow-lg">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-200/80 bg-slate-50/80 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
              <th className="py-4 px-4 w-12 text-center">Status</th>
              <th className="py-4 px-4 min-w-[260px]">Task Title &amp; Description</th>
              <th className="py-4 px-4 w-32">Priority</th>
              <th className="py-4 px-4 w-36">Due Date</th>
              <th className="py-4 px-4 w-28 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {tasks.map((task) => {
              const statusBadge = getStatusBadge(task.status);
              const priorityBadge = getPriorityBadge(task.priority);
              const isOverdue =
                task.dueDate &&
                task.status !== "DONE" &&
                new Date(task.dueDate) < new Date(new Date().setHours(0, 0, 0, 0));

              return (
                <tr
                  key={task.id}
                  className="group hover:bg-sky-50/40 transition-colors"
                >
                  {/* Status Toggle Button */}
                  <td className="py-3.5 px-4 text-center">
                    <button
                      onClick={() => onToggleStatus(task)}
                      title={`Click to advance: ${task.status}`}
                      className="p-1.5 rounded-lg hover:bg-slate-100 transition-transform active:scale-90 inline-flex items-center justify-center"
                    >
                      {statusBadge.icon}
                    </button>
                  </td>

                  {/* Title & Description */}
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col">
                      <span
                        className={`font-bold text-sm transition-colors ${
                          task.status === "DONE"
                            ? "line-through text-slate-400"
                            : "text-slate-900 group-hover:text-sky-600"
                        }`}
                      >
                        {task.title}
                      </span>
                      {task.description && (
                        <span className="text-slate-500 line-clamp-1 mt-0.5 text-xs">
                          {task.description}
                        </span>
                      )}
                    </div>
                  </td>

                  {/* Priority Badge */}
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] border ${priorityBadge.classes}`}
                    >
                      {priorityBadge.label}
                    </span>
                  </td>

                  {/* Due Date */}
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Calendar
                        className={`w-3.5 h-3.5 ${isOverdue ? "text-rose-500" : "text-sky-500"}`}
                      />
                      {task.dueDate ? (
                        <span
                          suppressHydrationWarning
                          className={`font-semibold ${
                            isOverdue
                              ? "text-rose-600"
                              : "text-slate-700"
                          }`}
                        >
                          {new Date(task.dueDate).toLocaleDateString()}
                          {isOverdue && (
                            <span className="ml-1 text-[10px] text-rose-500 font-bold">(Overdue)</span>
                          )}
                        </span>
                      ) : (
                        <span className="text-slate-400 italic">No deadline</span>
                      )}
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-70 group-hover:opacity-100 transition-opacity">
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
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
