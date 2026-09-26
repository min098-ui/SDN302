import Link from "next/link";
import { Users, ArrowLeft, ShieldCheck, UserCheck, FolderKanban, Sparkles } from "lucide-react";

export default function TeamsPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-16 space-y-12">
      {/* Top Header */}
      <div className="text-center space-y-4">
        {/* Cute Snow Fox Mascot Avatar */}
        <div className="w-20 h-20 mx-auto flex items-center justify-center">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/mascot-fox.png"
            alt="Snow Fox Teams"
            width={76}
            height={76}
            className="object-contain animate-cute-float drop-shadow-md mascot-fox-img"
          />
        </div>

        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full theme-accent-badge border text-xs font-bold uppercase tracking-wider shadow-2xs">
          <Sparkles className="w-3.5 h-3.5" />
          Teams Feature Preview
        </div>

        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Team Management &amp; Collaboration
        </h1>

        <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed">
          The Teams section is currently under development and will be activated in{" "}
          <strong style={{ color: "var(--accent-color)" }}>upcoming workspace releases</strong>. Here is what TaskSync
          is cooking up next:
        </p>
      </div>

      {/* Feature Preview Cards with 3 Rich Luminous Colors */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card 1: Cyan / Sky */}
        <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border theme-mascot-card hover:-translate-y-1 transition-all space-y-3 group shadow-lg">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500/15 to-cyan-500/15 text-sky-600 flex items-center justify-center border border-sky-200/80 group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            Create &amp; Organize Teams
          </h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Create workspaces for departments, projects, or study groups with distinct descriptions
            and owners.
          </p>
        </div>

        {/* Card 2: Emerald / Mint */}
        <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-emerald-200/80 hover:border-emerald-400 shadow-lg shadow-emerald-500/5 hover:-translate-y-1 transition-all space-y-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500/15 to-teal-500/15 text-emerald-600 flex items-center justify-center border border-emerald-200/80 group-hover:scale-110 transition-transform">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Role-Based Access</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Assign team roles (<code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-semibold border border-emerald-200">OWNER</code>,{" "}
            <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-semibold border border-emerald-200">ADMIN</code>,{" "}
            <code className="text-emerald-700 bg-emerald-50 px-1 py-0.5 rounded font-semibold border border-emerald-200">MEMBER</code>) defined
            in our Prisma <code className="text-sky-700 bg-sky-50 px-1 py-0.5 rounded font-semibold border border-sky-200">TeamMember</code> schema.
          </p>
        </div>

        {/* Card 3: Violet / Purple */}
        <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border border-purple-200/80 hover:border-purple-400 shadow-lg shadow-purple-500/5 hover:-translate-y-1 transition-all space-y-3 group">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500/15 to-pink-500/15 text-purple-600 flex items-center justify-center border border-purple-200/80 group-hover:scale-110 transition-transform">
            <UserCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-slate-900">Task Assignment</h3>
          <p className="text-xs text-slate-600 leading-relaxed">
            Assign tasks directly to team members with due date tracking, priority tags, and notifications.
          </p>
        </div>
      </div>

      {/* Schema Notice */}
      <div className="p-6 rounded-3xl bg-white/85 backdrop-blur-xl border theme-mascot-card shadow-lg flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl theme-gradient-btn flex items-center justify-center shrink-0 shadow-md">
            <FolderKanban className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900">
              Prisma Schema Ready
            </h4>
            <p className="text-xs text-slate-600">
              The <code className="font-semibold text-sky-700 bg-sky-50 px-1 py-0.5 rounded border border-sky-200">Team</code> and{" "}
              <code className="font-semibold text-sky-700 bg-sky-50 px-1 py-0.5 rounded border border-sky-200">TeamMember</code> models are
              already configured in <code className="font-semibold text-indigo-700 bg-indigo-50 px-1 py-0.5 rounded border border-indigo-200">schema.prisma</code>.
            </p>
          </div>
        </div>

        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl theme-gradient-btn text-white text-xs font-bold hover:scale-105 active:scale-95 transition-all shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Tasks</span>
        </Link>
      </div>
    </div>
  );
}
