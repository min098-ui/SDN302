"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Calendar, AlertCircle, Loader2 } from "lucide-react";
import { Task, TaskFormData, TaskPriority, TaskStatus } from "@/lib/types";
import { useLanguage } from "@/lib/languageContext";

interface TaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialTask?: Task | null;
}

export default function TaskModal({ isOpen, onClose, onSubmit, initialTask }: TaskModalProps) {
  const { t } = useLanguage();
  const [formData, setFormData] = useState<TaskFormData>(() => ({
    title: initialTask?.title || "",
    description: initialTask?.description || "",
    status: initialTask?.status || "TODO",
    priority: initialTask?.priority || "MEDIUM",
    dueDate: initialTask?.dueDate ? initialTask.dueDate.substring(0, 10) : "",
  }));

  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Client-side validation
    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (formData.title.length > 100) {
      setError("Title cannot exceed 100 characters.");
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      await onSubmit(formData);
      onClose();
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-lg bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-sky-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-sky-50/50 via-indigo-50/30 to-purple-50/30">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <Image
                src="/mascot-fox.png"
                alt="Snow Fox Mascot"
                width={40}
                height={40}
                className="object-contain drop-shadow-xs animate-cute-float"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>{initialTask ? t("modalEditTitle") : t("modalCreateTitle")}</span>
                <span className="text-[11px] font-semibold theme-accent-badge px-2 py-0.5 rounded-full border">
                  TaskSync
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                {initialTask ? t("modalEditSub") : t("modalCreateSub")}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-center gap-2 p-3 text-sm text-rose-700 bg-rose-50 border border-rose-200 rounded-2xl">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t("labelTitle")} <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              maxLength={100}
              placeholder={t("placeholderTitle")}
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs shadow-2xs transition-all"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t("labelDescription")}
            </label>
            <textarea
              rows={3}
              placeholder={t("placeholderDesc")}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs shadow-2xs transition-all resize-none"
            />
          </div>

          {/* Grid for Status and Priority */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Status */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t("labelStatus")}
              </label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs shadow-2xs transition-all font-medium"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                {t("labelPriority")}
              </label>
              <select
                value={formData.priority}
                onChange={(e) =>
                  setFormData({ ...formData, priority: e.target.value as TaskPriority })
                }
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs shadow-2xs transition-all font-medium"
              >
                <option value="LOW">{t("priorityLow")}</option>
                <option value="MEDIUM">{t("priorityMedium")}</option>
                <option value="HIGH">{t("priorityHigh")}</option>
              </select>
            </div>
          </div>

          {/* Due Date */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              {t("labelDueDate")}
            </label>
            <div className="relative">
              <input
                type="date"
                value={formData.dueDate}
                onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-sky-500 text-xs shadow-2xs transition-all font-medium"
              />
              <Calendar className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50"
            >
              {t("btnCancel")}
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-xs font-bold text-white theme-gradient-btn hover:scale-105 active:scale-95 shadow-md transition-all disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{initialTask ? t("btnSaving") : t("btnCreating")}</span>
                </>
              ) : (
                <span>{initialTask ? t("btnSaveChanges") : t("btnCreateTask")}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
