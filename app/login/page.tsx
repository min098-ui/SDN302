import Link from "next/link";
import { ArrowLeft, ShieldCheck, Sparkles } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="max-w-md mx-auto px-4 py-16 space-y-6">
      <div className="text-center space-y-3">
        {/* Cute Snow Fox Mascot Avatar */}
        <div className="w-20 h-20 mx-auto flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot-fox.png"
            alt="Snow Fox Mascot"
            width={76}
            height={76}
            className="object-contain animate-cute-float drop-shadow-md mascot-fox-img"
          />
        </div>

        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Authentication
        </h1>
        <p className="text-xs text-slate-500 flex items-center justify-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
          <span>Public Access Mode &bull; No Login Required</span>
        </p>
      </div>

      <div className="bg-white/85 backdrop-blur-xl border theme-mascot-card rounded-3xl p-7 shadow-xl space-y-5 text-center">
        <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-xs leading-relaxed flex items-start gap-2.5 text-left">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
          <span>
            This application is configured for open public CRUD operations without requiring user login or session tokens.
          </span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          User authentication and password hashing will be integrated with our Prisma{" "}
          <code className="bg-sky-50 text-sky-700 px-1.5 py-0.5 rounded-md font-semibold border border-sky-200">User</code> model in upcoming releases.
        </p>

        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 w-full py-3 rounded-2xl theme-gradient-btn hover:scale-105 active:scale-95 text-white text-xs font-bold shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Task Board</span>
        </Link>
      </div>
    </div>
  );
}
