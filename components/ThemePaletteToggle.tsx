"use client";

import { useEffect, useState } from "react";
import { Palette } from "lucide-react";

export default function ThemePaletteToggle() {
  const [theme, setTheme] = useState<"ocean" | "sunset">("ocean");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem("color-theme") as "ocean" | "sunset" | null;
    if (saved === "sunset") {
      setTheme("sunset");
      document.documentElement.setAttribute("data-theme", "sunset");
    } else {
      setTheme("ocean");
      document.documentElement.setAttribute("data-theme", "ocean");
    }
  }, []);

  const toggleTheme = () => {
    const nextTheme = theme === "ocean" ? "sunset" : "ocean";
    setTheme(nextTheme);
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("color-theme", nextTheme);
  };

  if (!mounted) {
    return (
      <div className="w-8 h-8 rounded-xl bg-slate-100/60 border border-slate-200/50" />
    );
  }

  return (
    <button
      onClick={toggleTheme}
      type="button"
      title={
        theme === "ocean"
          ? "Đang dùng: Xanh Biển Cực Quang • Bấm để đổi sang Hoàng Hôn San Hô"
          : "Đang dùng: Hoàng Hôn San Hô • Bấm để đổi sang Xanh Biển Cực Quang"
      }
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-2xs border ${
        theme === "ocean"
          ? "bg-white/90 hover:bg-sky-50 text-sky-800 border-sky-200/90 shadow-sky-500/10"
          : "bg-white/90 hover:bg-amber-50 text-amber-800 border-amber-200/90 shadow-amber-500/10"
      }`}
    >
      <Palette
        className={`w-3.5 h-3.5 transition-transform ${
          theme === "sunset" ? "text-amber-500 rotate-12" : "text-sky-500"
        }`}
      />

      {/* 2 mini color sample dots showing the palette vibe */}
      <span className="flex items-center -space-x-1">
        <span
          className={`w-2 h-2 rounded-full ring-1 ring-white ${
            theme === "ocean" ? "bg-sky-400" : "bg-orange-400"
          }`}
        />
        <span
          className={`w-2 h-2 rounded-full ring-1 ring-white ${
            theme === "ocean" ? "bg-purple-500" : "bg-rose-500"
          }`}
        />
      </span>

      <span className="text-[11px] font-bold">
        {theme === "ocean" ? "Ocean Theme" : "Sunset Theme"}
      </span>
    </button>
  );
}
