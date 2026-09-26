"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LogIn, CheckSquare } from "lucide-react";
import Logo from "@/components/Logo";
import ThemePaletteToggle from "@/components/ThemePaletteToggle";

export default function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/80 border-b border-slate-200/70 shadow-sm shadow-slate-900/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <Logo href="/" size="md" subtitle="Workspace Management" />

        {/* Navigation Links */}
        <nav className="flex items-center gap-1.5 sm:gap-2.5">
          <Link
            href="/"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              pathname === "/"
                ? "theme-accent-badge border shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
            }`}
          >
            <CheckSquare className="w-4 h-4" style={{ color: "var(--accent-color)" }} />
            <span>Tasks</span>
          </Link>

          <Link
            href="/teams"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              pathname === "/teams"
                ? "theme-accent-badge border shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
            }`}
          >
            <Users className="w-4 h-4" style={{ color: pathname === "/teams" ? "var(--accent-color)" : undefined }} />
            <span>Teams</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold border ${
                pathname === "/teams"
                  ? "bg-white/40 text-current border-current/30"
                  : "bg-slate-100 text-slate-600 border-slate-200"
              }`}
            >
              SOON
            </span>
          </Link>

          <Link
            href="/login"
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              pathname === "/login"
                ? "theme-accent-badge border shadow-2xs font-bold"
                : "text-slate-600 hover:text-slate-900 hover:bg-white/80"
            }`}
          >
            <LogIn className="w-4 h-4" style={{ color: pathname === "/login" ? "var(--accent-color)" : undefined }} />
            <span>Sign In</span>
          </Link>

          <div className="flex items-center gap-2 ml-1 sm:ml-2 pl-2 sm:pl-3 border-l border-slate-200/80">
            <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/70 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Workspace
            </span>
            <ThemePaletteToggle />
          </div>
        </nav>
      </div>
    </header>
  );
}
