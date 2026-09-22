import Link from "next/link";
import { ArrowLeft, Lock, Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-20 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
          <Lock className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Authentication</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400">
          Public Access Mode &bull; No Login Required for Assignment 1
        </p>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-sm space-y-4 text-center">
        <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/40 text-emerald-800 dark:text-emerald-300 text-xs leading-relaxed flex items-start gap-2 text-left">
          <Shield className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>
            Per <strong>Assignment 1 specifications</strong>, this app is configured for open public
            CRUD operations without requiring user login or session tokens.
          </span>
        </div>

        <p className="text-xs text-slate-500 dark:text-slate-400">
          User authentication and password hashing will be integrated with our Prisma{" "}
          <code>User</code> model in upcoming assignments.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold shadow-md shadow-indigo-600/20 transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Task Board
        </Link>
      </div>
    </div>
  );
}
