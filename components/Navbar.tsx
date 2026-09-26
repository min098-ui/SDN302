"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LogIn, CheckSquare } from "lucide-react";
import Logo from "@/components/Logo";
import ThemePaletteToggle from "@/components/ThemePaletteToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/languageContext";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/85 border-b border-slate-200/70 shadow-xs shadow-slate-900/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <Logo href="/" size="md" subtitle="Workspace Management" />

        {/* Navigation & Controls */}
        <nav className="flex items-center gap-1.5 sm:gap-2">
          {/* Main Links */}
          <div className="flex items-center gap-1 sm:gap-1.5">
            <Link
              href="/"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                pathname === "/"
                  ? "theme-accent-badge border shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <CheckSquare className="w-4 h-4" style={{ color: "var(--accent-color)" }} />
              <span>{t("navTasks")}</span>
            </Link>

            <Link
              href="/teams"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                pathname === "/teams"
                  ? "theme-accent-badge border shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <Users className="w-4 h-4" style={{ color: pathname === "/teams" ? "var(--accent-color)" : undefined }} />
              <span>{t("navTeams")}</span>
              <span
                className={`text-[9px] px-1.5 py-0.2 rounded-full font-bold border ${
                  pathname === "/teams"
                    ? "bg-white/40 text-current border-current/30"
                    : "bg-slate-100 text-slate-500 border-slate-200/80"
                }`}
              >
                {t("navSoon")}
              </span>
            </Link>

            <Link
              href="/login"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
                pathname === "/login"
                  ? "theme-accent-badge border shadow-2xs font-bold"
                  : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/70"
              }`}
            >
              <LogIn className="w-4 h-4" style={{ color: pathname === "/login" ? "var(--accent-color)" : undefined }} />
              <span>{t("navSignIn")}</span>
            </Link>
          </div>

          {/* Elegant Divider */}
          <div className="h-5 w-[1px] bg-slate-200/80 mx-1" />

          {/* Utility Tools: Live Status, Language, Theme */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-xl bg-emerald-50/90 text-emerald-700 border border-emerald-200/70 shadow-2xs">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>{t("liveWorkspace")}</span>
            </span>

            <LanguageToggle />

            <ThemePaletteToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
