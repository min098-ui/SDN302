"use client";

import { useEffect, useState } from "react";
import { Globe } from "lucide-react";
import { useLanguage } from "@/lib/languageContext";

export default function LanguageToggle() {
  const { language, toggleLanguage } = useLanguage();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <div className="w-16 h-7 rounded-xl bg-slate-100/60 border border-slate-200/50" />
    );
  }

  return (
    <button
      onClick={toggleLanguage}
      type="button"
      title={language === "en" ? "Chuyển sang Tiếng Việt" : "Switch to English"}
      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs border bg-white/90 hover:bg-slate-50/90 text-slate-700 border-slate-200/90 hover:border-sky-300"
    >
      <Globe className="w-3.5 h-3.5 text-sky-500 transition-transform hover:rotate-45" />

      <span className="inline-flex items-center gap-1 text-[11px] font-bold tracking-wide">
        <span
          className={`transition-colors ${
            language === "en" ? "text-sky-600 font-extrabold" : "text-slate-400 font-medium"
          }`}
        >
          EN
        </span>
        <span className="text-slate-300 text-[10px]">/</span>
        <span
          className={`transition-colors ${
            language === "vi" ? "text-amber-600 font-extrabold" : "text-slate-400 font-medium"
          }`}
        >
          VI
        </span>
      </span>
    </button>
  );
}
