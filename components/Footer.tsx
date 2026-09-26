"use client";

import { Database, Cloud, Layers, Terminal } from "lucide-react";
import Logo from "@/components/Logo";
import { useLanguage } from "@/lib/languageContext";

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="mt-auto border-t border-slate-200/80 bg-white/75 backdrop-blur-md transition-colors py-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
            <Logo size="md" subtitle={t("footerSubtitle")} />
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2.5 text-xs text-slate-600">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-sky-50 text-sky-700 border border-sky-200/80 font-semibold shadow-2xs">
              <Layers className="w-3.5 h-3.5 text-sky-500" /> Next.js 16
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-200/80 font-semibold shadow-2xs">
              <Database className="w-3.5 h-3.5 text-indigo-500" /> Prisma ORM
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/80 font-semibold shadow-2xs">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" /> Supabase
            </span>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-pink-50 text-pink-700 border border-pink-200/80 font-semibold shadow-2xs">
              <Cloud className="w-3.5 h-3.5 text-pink-500" /> Vercel
            </span>
          </div>
        </div>

        <div
          suppressHydrationWarning
          className="mt-8 pt-6 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500"
        >
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-slate-700">TaskSync Workspace</span>
            <span>&bull; Powered by Next.js &amp; Prisma ORM</span>
          </div>
          <div>&copy; {new Date().getFullYear()} TaskSync. All rights reserved.</div>
        </div>
      </div>
    </footer>
  );
}
