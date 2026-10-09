"use client";

import { useState } from "react";
import { X, Calendar, AlertCircle, Loader2, Sparkles } from "lucide-react";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        className="w-full max-w-xl bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200/60 flex flex-col max-h-[95vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Premium Look */}
        <div className="relative px-8 py-6 bg-slate-900 overflow-hidden shrink-0">
          <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-gradient-to-br from-primary-500/40 via-secondary-500/30 to-transparent blur-[50px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
          
          <div className="relative z-10 flex items-start justify-between">
            <div className="flex items-center gap-4">
              <div className="relative flex items-center justify-center shrink-0">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot-bunny-nobg.png"
                  alt="Snow Bunny Mascot"
                  className="mascot-bunny-img w-14 h-14 object-contain drop-shadow-lg animate-cute-float"
                />
              </div>
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 text-primary-300 text-[10px] font-bold border border-white/20 mb-1.5 uppercase tracking-wider">
                  <Sparkles className="w-3 h-3" />
                  AuraSync
                </div>
                <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                  {initialTask ? t("modalEditTitle") : t("modalCreateTitle")}
                </h3>
              </div>
            </div>
            
            <button
              onClick={onClose}
              type="button"
              className="p-2 rounded-xl text-white/50 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="overflow-y-auto custom-scrollbar">
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {error && (
              <div className="flex items-center gap-2 p-4 text-sm text-rose-700 bg-rose-50/80 border border-rose-200 rounded-2xl backdrop-blur-sm shadow-sm">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Title */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                {t("labelTitle")} <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                maxLength={100}
                placeholder={t("placeholderTitle")}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs"
              />
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                {t("labelDescription")}
              </label>
              <textarea
                rows={3}
                placeholder={t("placeholderDesc")}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-medium text-slate-900 placeholder:text-slate-400 shadow-2xs resize-none"
              />
            </div>

            {/* Grid for Status, Priority, Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {/* Status */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  {t("labelStatus")}
                </label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value as TaskStatus })}
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold text-slate-700 shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
              </div>

              {/* Priority */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  {t("labelPriority")}
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) =>
                    setFormData({ ...formData, priority: e.target.value as TaskPriority })
                  }
                  className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold text-slate-700 shadow-2xs appearance-none cursor-pointer"
                >
                  <option value="LOW">{t("priorityLow")}</option>
                  <option value="MEDIUM">{t("priorityMedium")}</option>
                  <option value="HIGH">{t("priorityHigh")}</option>
                </select>
              </div>

              {/* Due Date */}
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider ml-1">
                  {t("labelDueDate")}
                </label>
                <div className="relative">
                  <input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-5 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-4 focus:ring-primary-500/10 focus:border-primary-500 transition-all text-sm font-bold text-slate-700 shadow-2xs"
                  />
                  <Calendar className="w-5 h-5 text-slate-400 absolute right-4 top-3.5 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Footer Actions */}
            <div className="flex items-center justify-end gap-3 pt-6 mt-4">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="px-6 py-3.5 rounded-2xl text-sm font-bold text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                {t("btnCancel")}
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl text-sm font-bold text-white bg-primary-500 hover:bg-primary-600 shadow-xl shadow-primary-500/20 hover:shadow-primary-500/30 hover:-translate-y-0.5 active:translate-y-0 transition-all disabled:opacity-50 disabled:pointer-events-none"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
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
    </div>
  );
}
