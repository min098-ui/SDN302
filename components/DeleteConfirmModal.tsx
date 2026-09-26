"use client";

import { AlertTriangle, Trash2, X } from "lucide-react";
import { Task } from "@/lib/types";
import { useLanguage } from "@/lib/languageContext";

interface DeleteConfirmModalProps {
  isOpen: boolean;
  task: Task | null;
  isDeleting: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
}

export default function DeleteConfirmModal({
  isOpen,
  task,
  isDeleting,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) {
  const { t } = useLanguage();

  if (!isOpen || !task) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-rose-200/80 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot-fox.png"
                alt="Snow Fox Mascot"
                width={38}
                height={38}
                className="object-contain drop-shadow-xs mascot-fox-img"
              />
            </div>
            <div>
              <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                <span>{t("deleteTitle")}</span>
              </h3>
              <p className="text-xs text-rose-600/80">{t("deleteWarning")}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            type="button"
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-rose-50/70 border border-rose-200/60 mb-5">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
            <div className="text-xs text-rose-800 leading-relaxed">
              {t("deleteDesc")}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 mb-6">
            <p className="text-xs text-slate-500 font-semibold mb-1">{t("deleteTaskLabel")}</p>
            <p className="text-sm font-bold text-slate-900 line-clamp-2">{task.title}</p>
            {task.description && (
              <p className="text-xs text-slate-600 line-clamp-2 mt-1 italic">
                {task.description}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3">
            <button
              onClick={onClose}
              disabled={isDeleting}
              type="button"
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
            >
              {t("btnCancel")}
            </button>
            <button
              onClick={onConfirm}
              disabled={isDeleting}
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-50"
            >
              <Trash2 className="w-4 h-4" />
              {isDeleting ? t("btnDeleting") : t("btnDeleteNow")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
