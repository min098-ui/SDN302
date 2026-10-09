"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Users, LogIn, CheckSquare, LogOut, LayoutDashboard } from "lucide-react";
import Logo from "@/components/Logo";
import ThemePaletteToggle from "@/components/ThemePaletteToggle";
import LanguageToggle from "@/components/LanguageToggle";
import { useLanguage } from "@/lib/languageContext";
import { useSession, signOut } from "next-auth/react";

export default function Navbar() {
  const pathname = usePathname();
  const { t } = useLanguage();
  const { data: session } = useSession();

  return (
    <header className="sticky top-0 z-50 backdrop-blur-2xl bg-white/80 border-b border-slate-200/60 shadow-xs shadow-slate-900/5 transition-all">
      <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-20 sm:h-24 flex items-center justify-between gap-4">
        
        {/* Left: Brand / Logo */}
        <div className="flex-shrink-0 relative z-20">
          <Logo href="/" size="lg" showSubtitle={false} />
        </div>

        {/* Middle: Navigation Links (Desktop) */}
        <nav className="hidden lg:flex items-center justify-center gap-1 flex-1 px-4">
          <div className="flex items-center gap-1 bg-slate-100/50 p-1 rounded-2xl border border-slate-200/50">
            <Link
              href="/"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                pathname === "/"
                  ? "bg-white theme-text border border-slate-200/80 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              <CheckSquare className="w-4.5 h-4.5" style={{ color: pathname === "/" ? "var(--accent-color)" : undefined }} />
              <span>{t("navTasks")}</span>
            </Link>

            <Link
              href="/teams"
              className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${
                pathname.startsWith("/teams") || pathname.startsWith("/dashboard")
                  ? "bg-white theme-text border border-slate-200/80 shadow-sm"
                  : "text-slate-500 hover:text-slate-800 hover:bg-slate-200/50"
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" style={{ color: pathname.startsWith("/teams") || pathname.startsWith("/dashboard") ? "var(--accent-color)" : undefined }} />
              <span>Teams & Workspace</span>
            </Link>
          </div>
        </nav>

        {/* Right: User Controls & Utility */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0 relative z-20">
          
          <div className="hidden xl:flex items-center mr-2">
             {session?.user && (
               <div className="flex items-center gap-2.5 px-2.5 py-1.5 rounded-2xl bg-white border border-slate-200/80 shadow-sm hover:border-primary-200 hover:shadow-md transition-all cursor-pointer">
                 <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-primary-100 to-secondary-100 border border-primary-200 flex items-center justify-center text-primary-700 font-black text-sm shrink-0">
                   {session.user.name?.charAt(0).toUpperCase()}
                 </div>
                 <div className="flex flex-col max-w-[200px]">
                   <span className="text-xs font-extrabold text-slate-900 truncate leading-tight">
                     {session.user.name}
                   </span>
                   <span className="text-[9px] font-medium text-slate-500 truncate leading-tight">
                     {session.user.email}
                   </span>
                 </div>
               </div>
             )}
          </div>

          <div className="hidden xl:block h-7 w-[1px] bg-slate-200 mx-1" />

          {/* Nav links for smaller screens (under lg) */}
          <div className="flex lg:hidden items-center gap-1 mr-1">
             <Link href="/" className={`p-2 rounded-xl transition-colors ${pathname === "/" ? "bg-slate-100 theme-text" : "text-slate-500 hover:bg-slate-100"}`}>
               <CheckSquare className="w-5 h-5" />
             </Link>
             <Link href="/teams" className={`p-2 rounded-xl transition-colors ${pathname.startsWith("/teams") || pathname.startsWith("/dashboard") ? "bg-slate-100 theme-text" : "text-slate-500 hover:bg-slate-100"}`}>
               <LayoutDashboard className="w-5 h-5" />
             </Link>
          </div>

          <LanguageToggle />
          <ThemePaletteToggle />

          {!session ? (
            <Link
              href="/login"
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white theme-gradient-btn hover:scale-105 active:scale-95 transition-all shadow-md ml-1"
            >
              <LogIn className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">{t("navSignIn")}</span>
            </Link>
          ) : (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-1.5 p-2.5 sm:px-4 sm:py-2.5 rounded-xl text-sm font-bold text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-transparent hover:border-rose-100 transition-all ml-1"
              title="Logout"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
