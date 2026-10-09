"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Users, FolderKanban, Search, Sparkles, Loader2, ArrowRight, Lock, LayoutGrid, Clock, X, Zap } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/languageContext";

export default function TeamsPage() {
  const { t } = useLanguage();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [teams, setTeams] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  // Create Team Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newTeamDesc, setNewTeamDesc] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  useEffect(() => {
    if (status === "authenticated") {
      fetchTeams();
    }
  }, [status]);

  async function fetchTeams() {
    try {
      const res = await fetch("/api/teams");
      if (res.ok) {
        const data = await res.json();
        setTeams(data);
      } else {
        toast.error("Failed to load teams");
      }
    } catch (error) {
      toast.error("Error loading teams");
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);

    try {
      const res = await fetch("/api/teams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newTeamName, description: newTeamDesc }),
      });

      if (res.ok) {
        toast.success("Team created successfully!");
        setNewTeamName("");
        setNewTeamDesc("");
        setIsCreateModalOpen(false);
        fetchTeams(); // Reload the teams to show the new one
      } else {
        toast.error("Failed to create team");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsCreating(false);
    }
  };

  if (status === "loading" || (status === "authenticated" && isLoading)) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="bg-white p-10 sm:p-14 rounded-3xl border border-slate-100 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.05)] text-center max-w-xl w-full">
          <div className="w-20 h-20 bg-primary-50 rounded-3xl mx-auto flex items-center justify-center mb-6 border border-primary-100/50">
            <Lock className="w-8 h-8 text-primary-600" />
          </div>
          <h2 className="text-3xl font-black text-slate-900 mb-3 tracking-tight">{t("signInRequired")}</h2>
          <p className="text-slate-500 font-medium leading-relaxed mb-8">
            {t("signInDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/login" className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white font-bold shadow-[0_8px_20px_rgba(14,165,233,0.25)] transition-all hover:-translate-y-0.5 active:scale-95 text-sm">
              {t("btnSignInNow")}
            </Link>
            <Link href="/register" className="px-8 py-3.5 rounded-2xl bg-white border border-slate-200 text-primary-600 font-bold hover:bg-slate-50 transition-all hover:-translate-y-0.5 active:scale-95 text-sm shadow-sm">
              {t("btnCreateAccount")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase())
  );
  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-14 space-y-12 animate-in fade-in duration-500">
      
      {/* Dark Hero Banner */}
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-10 md:p-14 text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/30 via-secondary-500/20 to-transparent blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-primary-500/20 to-emerald-500/10 blur-[60px] rounded-full translate-y-1/4 pointer-events-none" />
        
        <div className="relative z-10 flex flex-col items-start gap-4">
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 text-primary-300 border border-white/20 shadow-sm backdrop-blur-md">
            <Zap className="w-4 h-4" />
            <span className="text-[11px] font-black tracking-widest uppercase">{t("cmdCenter")}</span>
          </div>
          
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight">
            {t("welcomeBack")}, <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-300">{session?.user?.name?.split(" ")[0] || "User"}</span>
          </h1>
          
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-3xl leading-relaxed mt-2">
            {t("teamsHeroDesc")}
          </p>
        </div>
      </section>

      <div className="space-y-8 relative z-10">
        
        {/* Title & Action Section */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <h2 className="text-3xl font-black text-slate-900 flex items-center gap-4">
            <div className="relative shrink-0 flex items-center justify-center animate-cute-float w-12 h-12 [perspective:800px]">
              <style>{`
                @keyframes mini-ring-spin {
                  from { transform: translate(-50%, -50%) rotateX(65deg) rotateY(15deg) rotateZ(0deg); }
                  to { transform: translate(-50%, -50%) rotateX(65deg) rotateY(15deg) rotateZ(360deg); }
                }
                @keyframes mini-ring-spin-reverse {
                  from { transform: translate(-50%, -50%) rotateX(55deg) rotateY(-15deg) rotateZ(0deg); }
                  to { transform: translate(-50%, -50%) rotateX(55deg) rotateY(-15deg) rotateZ(-360deg); }
                }
              `}</style>
              <div className="absolute top-1/2 left-1/2 w-[50px] h-[50px] rounded-full border-[1.5px] border-primary-400 border-t-transparent border-r-transparent shadow-[0_0_8px_rgba(56,189,248,0.6)] z-0" style={{ animation: 'mini-ring-spin 4s linear infinite' }} />
              <div className="absolute top-1/2 left-1/2 w-[60px] h-[60px] rounded-full border-[1px] border-secondary-300 border-b-transparent border-l-transparent shadow-[0_0_6px_rgba(34,211,238,0.4)] z-0" style={{ animation: 'mini-ring-spin-reverse 6s linear infinite' }} />
              <img src="/mascot-bunny-nobg.png" alt="Bunny" className="mascot-bunny-img w-9 h-9 object-contain relative z-10 drop-shadow-md" />
            </div>
            {t("myWorkspaces")}
          </h2>
          
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-5 py-2.5 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 active:scale-95 flex items-center justify-center gap-2 text-sm"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            {t("createNewTeam")}
          </button>
        </div>

        {/* Grid of Teams - Solid White, Apple inspired */}
        {filteredTeams.length === 0 ? (
          <div className="text-center py-32 bg-white rounded-3xl border border-slate-200/60 shadow-[0_8px_30px_rgb(0,0,0,0.03)]">
            <div className="w-20 h-20 bg-slate-50 rounded-2xl mx-auto flex items-center justify-center mb-6 border border-slate-100">
              <FolderKanban className="w-10 h-10 text-slate-300" />
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{t("noWorkspacesFound")}</h3>
            <p className="text-slate-500 font-medium mb-6">{t("noWorkspacesDesc")}</p>
            <button 
              onClick={() => setIsCreateModalOpen(true)}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary-500 to-secondary-500 text-white font-bold text-sm shadow-md hover:-translate-y-0.5 transition-all"
            >
              {t("createFirstTeam")}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
            {filteredTeams.map((team) => {
              const isOwner = team.ownerId === (session?.user as any)?.id;
              
              return (
                <div 
                  key={team.id} 
                  className="group relative bg-white border border-slate-200/60 hover:border-slate-300/60 rounded-[2.5rem] p-7 sm:p-8 shadow-[0_8px_30px_rgba(0,0,0,0.02)] hover:shadow-[0_20px_40px_rgba(0,0,0,0.06)] transition-all duration-500 flex flex-col h-[320px] overflow-hidden hover:-translate-y-1"
                >
                  {/* Subtle Glow on Hover */}
                  <div className="absolute top-0 right-0 w-40 h-40 bg-primary-400/10 blur-[40px] rounded-full translate-x-1/3 -translate-y-1/3 opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />
                  
                  <div className="flex-1 relative z-10 flex flex-col">
                    <div className="flex justify-between items-start mb-5">
                      {/* Premium Avatar */}
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-50 to-slate-100 border border-slate-200/80 shadow-sm flex items-center justify-center text-xl font-black text-slate-700 group-hover:from-primary-50 group-hover:to-secondary-50 group-hover:text-primary-600 group-hover:border-primary-200 transition-all duration-500 group-hover:scale-110">
                        {team.name.charAt(0).toUpperCase()}
                      </div>
                      {isOwner ? (
                        <div className="px-3 py-1.5 bg-white text-slate-700 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                          <Sparkles className="w-3.5 h-3.5 text-amber-500" /> {t("ownerLabel")}
                        </div>
                      ) : (
                        <div className="px-3 py-1.5 bg-white text-slate-500 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5 border border-slate-200/80 shadow-[0_2px_10px_rgba(0,0,0,0.02)]">
                          <Users className="w-3.5 h-3.5" /> {t("memberLabel")}
                        </div>
                      )}
                    </div>

                    <h3 className="font-black text-xl text-slate-900 group-hover:text-primary-600 transition-colors mb-2 leading-snug line-clamp-2">
                      {team.name}
                    </h3>
                    <p className="text-sm font-medium text-slate-500 line-clamp-2 leading-relaxed">
                      {team.description || t("noDescProvided")}
                    </p>
                  </div>

                  {/* Footer Stats & Button */}
                  <div className="mt-auto pt-5 border-t border-slate-100 flex items-center justify-between relative z-10">
                    <div className="flex items-center gap-3">
                      <div className="group/stat flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm hover:bg-primary-50 hover:border-primary-200 hover:text-primary-600 hover:shadow-primary-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-primary-400/0 via-primary-400/10 to-primary-400/0 translate-x-[-100%] group-hover/stat:translate-x-[100%] transition-transform duration-700" />
                        <Users className="w-4 h-4 text-slate-400 group-hover/stat:text-primary-500 group-hover/stat:scale-110 transition-transform relative z-10" />
                        <span className="text-sm font-bold relative z-10">
                          {team.members ? team.members.filter((m: any) => m.userId !== team.ownerId).length + 1 : 1}
                        </span>
                      </div>
                      <div className="group/stat flex items-center gap-1.5 text-slate-600 bg-white px-3 py-1.5 rounded-xl border border-slate-100 shadow-sm hover:bg-secondary-50 hover:border-secondary-200 hover:text-secondary-600 hover:shadow-secondary-500/20 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-r from-secondary-400/0 via-secondary-400/10 to-secondary-400/0 translate-x-[-100%] group-hover/stat:translate-x-[100%] transition-transform duration-700" />
                        <FolderKanban className="w-4 h-4 text-slate-400 group-hover/stat:text-secondary-500 group-hover/stat:scale-110 transition-transform relative z-10" />
                        <span className="text-sm font-bold relative z-10">{team._count?.tasks || 0}</span>
                      </div>
                    </div>

                    <Link 
                      href={`/teams/${team.id}`}
                      className="w-10 h-10 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-slate-900 group-hover:text-white group-hover:border-slate-900 transition-all shadow-sm group-hover:shadow-lg group-hover:-rotate-45 relative z-10"
                    >
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create Team Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsCreateModalOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 animate-in zoom-in-95 duration-300">
            
            <button 
              onClick={() => setIsCreateModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6">
              <div className="relative shrink-0 flex items-center justify-center animate-cute-float w-14 h-14 [perspective:800px]">
                <div className="absolute top-1/2 left-1/2 w-[60px] h-[60px] rounded-full border-[2px] border-primary-400 border-t-transparent border-r-transparent shadow-[0_0_8px_rgba(56,189,248,0.6)] z-0" style={{ animation: 'mini-ring-spin 4s linear infinite' }} />
                <div className="absolute top-1/2 left-1/2 w-[72px] h-[72px] rounded-full border-[1.5px] border-secondary-300 border-b-transparent border-l-transparent shadow-[0_0_6px_rgba(34,211,238,0.4)] z-0" style={{ animation: 'mini-ring-spin-reverse 6s linear infinite' }} />
                <div className="absolute top-1/2 left-1/2 w-[66px] h-[66px] z-0" style={{ animation: 'mini-ring-spin 3s linear infinite' }}>
                  <div className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_3px_rgba(255,255,255,0.9)] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <img src="/mascot-bunny-nobg.png" alt="Bunny" className="mascot-bunny-img w-10 h-10 object-contain relative z-10 drop-shadow-md" />
              </div>
              {t("createWorkspace")}
            </h2>
            
            <form onSubmit={handleCreateTeam} className="space-y-5">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                  {t("teamName")} <span className="text-primary-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                  placeholder={t("teamNamePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                  {t("descOptional")}
                </label>
                <textarea
                  value={newTeamDesc}
                  onChange={(e) => setNewTeamDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium min-h-[90px] resize-none shadow-sm"
                  placeholder={t("teamDescPlaceholder")}
                />
              </div>
              <button
                type="submit"
                disabled={isCreating}
                className="w-full mt-2 py-3 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none hover:-translate-y-0.5"
              >
                {isCreating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    {t("btnCreating")}
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" />
                    {t("btnCreateTeam")}
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
