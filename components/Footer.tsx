import { Database, Cloud, Layers, Terminal } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm transition-colors py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              TaskSync &bull; Assignment 1 Project
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              SDN302 – Next.js App Router, Prisma ORM, Supabase PostgreSQL, Vercel
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600 dark:text-slate-300">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
              <Layers className="w-3.5 h-3.5 text-indigo-500" /> Next.js
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
              <Database className="w-3.5 h-3.5 text-teal-500" /> Prisma ORM
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
              <Terminal className="w-3.5 h-3.5 text-emerald-500" /> Supabase
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-slate-100 dark:bg-slate-800">
              <Cloud className="w-3.5 h-3.5 text-sky-500" /> Vercel
            </span>
          </div>
        </div>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800/80 text-center text-xs text-slate-400">
          &copy; {new Date().getFullYear()} TaskSync. Built for SDN302 Assignment 1.
        </div>
      </div>
    </footer>
  );
}
