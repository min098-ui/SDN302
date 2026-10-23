"use client";

import { useState } from "react";
import { UsersRound, Plus, Crown, Shield, User, Mail, Trash2, LogOut, Loader2, Sparkles, AlertCircle, Info, ChevronDown } from "lucide-react";
import toast from "react-hot-toast";
import { useLanguage } from "@/lib/languageContext";

interface TeamMemberManagerProps {
  team: any;
  currentUserId: string;
  onRefresh: () => void;
}

export default function TeamMemberManager({ team, currentUserId, onRefresh }: TeamMemberManagerProps) {
  const { t } = useLanguage();
  const [newEmail, setNewEmail] = useState("");
  const [newRole, setNewRole] = useState("MEMBER");
  const [isInviting, setIsInviting] = useState(false);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  const isOwner = team.ownerId === currentUserId;
  const currentMembership = team.members.find((m: any) => m.userId === currentUserId);
  const currentUserRole = isOwner ? "OWNER" : currentMembership?.role || "MEMBER";
  const canManageMembers = isOwner || currentUserRole === "ADMIN";

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim() || isInviting) return;

    setIsInviting(true);
    try {
      const res = await fetch(`/api/teams/${team.id}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newEmail.trim(), role: newRole }),
      });

      if (res.ok) {
        toast.success("Member added successfully!");
        setNewEmail("");
        setNewRole("MEMBER");
        onRefresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add member");
      }
    } catch {
      toast.error("Network error adding member");
    } finally {
      setIsInviting(false);
    }
  };

  const handleRoleChange = async (targetUserId: string, updatedRole: string) => {
    setUpdatingUserId(targetUserId);
    try {
      const res = await fetch(`/api/teams/${team.id}/members/${targetUserId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: updatedRole }),
      });

      if (res.ok) {
        toast.success(`Role updated to ${updatedRole}`);
        onRefresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update role");
      }
    } catch {
      toast.error("Error updating role");
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleRemoveMember = async (targetUserId: string, targetName: string) => {
    const isSelf = targetUserId === currentUserId;
    const confirmMsg = isSelf
      ? "Are you sure you want to leave this team?"
      : `Remove ${targetName} from this team?`;

    if (!confirm(confirmMsg)) return;

    try {
      const res = await fetch(`/api/teams/${team.id}/members/${targetUserId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        toast.success(isSelf ? "You left the team" : "Member removed");
        onRefresh();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to remove member");
      }
    } catch {
      toast.error("Error removing member");
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-amber-50 text-amber-700 border border-amber-200/80 shadow-xs min-w-[96px]">
            <Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            OWNER
          </span>
        );
      case "ADMIN":
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-indigo-50 text-indigo-700 border border-indigo-200/80 shadow-xs min-w-[96px]">
            <Shield className="w-3.5 h-3.5 text-indigo-500" />
            ADMIN
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-700 border border-slate-200 shadow-xs min-w-[96px]">
            <User className="w-3.5 h-3.5 text-slate-400" />
            MEMBER
          </span>
        );
    }
  };

  return (
    <div className="space-y-8">
      {/* Role Permissions Summary Banner */}
      <div className="bg-gradient-to-r from-primary-50 via-secondary-50 to-indigo-50 border border-primary-100 rounded-3xl p-6 shadow-sm">
        <h4 className="font-extrabold text-slate-900 text-sm mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary-500" />
          {t("rbacMatrix")}
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs font-medium">
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-amber-100/80 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <Crown className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span className="font-black text-amber-800">{t("roleOwner")}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t("rbacOwnerDesc")}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-indigo-100/80 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <Shield className="w-4 h-4 text-indigo-500" />
              <span className="font-black text-indigo-800">{t("roleAdmin")}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t("rbacAdminDesc")}
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center gap-2 mb-1.5">
              <User className="w-4 h-4 text-slate-500" />
              <span className="font-black text-slate-800">{t("roleMember")}</span>
            </div>
            <p className="text-slate-600 leading-relaxed">
              {t("rbacMemberDesc")}
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Members List (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-[2.5rem] border border-slate-200/80 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
          <div className="flex items-center justify-between pb-6 border-b border-slate-100">
            <div>
              <h3 className="text-xl font-extrabold text-slate-900 flex items-center gap-2">
                <UsersRound className="w-5 h-5 text-primary-500" />
                {t("teamRoster")} ({1 + team.members.filter((m: any) => m.userId !== team.ownerId).length})
              </h3>
              <p className="text-xs font-medium text-slate-500 mt-1">
                {t("yourCurrentRole")} <span className="font-extrabold text-slate-800">{currentUserRole}</span>
              </p>
            </div>
          </div>

          <div className="mt-6 space-y-4">
            {/* Team Owner Row */}
            <div className="p-4 bg-amber-50/40 rounded-2xl border border-amber-200/60 flex items-center justify-between gap-3 sm:gap-4 shadow-xs">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-white font-black flex items-center justify-center text-base shadow-sm shrink-0">
                  {team.owner.name.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-extrabold text-slate-900 truncate flex items-center gap-2">
                    {team.owner.name}
                    {team.owner.id === currentUserId && (
                      <span className="text-[10px] font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full">
                        You
                      </span>
                    )}
                  </p>
                  <p className="text-xs font-medium text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {team.owner.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                <div className="w-28 flex justify-end items-center">
                  {getRoleBadge("OWNER")}
                </div>
                <div className="w-9 h-9 shrink-0" aria-hidden="true" />
              </div>
            </div>

            {/* Other Members */}
            {team.members
              .filter((m: any) => m.userId !== team.ownerId)
              .map((member: any) => {
                const isTargetSelf = member.userId === currentUserId;
                const canModifyRole =
                  isOwner || (currentUserRole === "ADMIN" && member.role !== "ADMIN");
                const canRemove =
                  isOwner || isTargetSelf || (currentUserRole === "ADMIN" && member.role === "MEMBER");

                return (
                  <div
                    key={member.id}
                    className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-primary-200 flex items-center justify-between gap-3 sm:gap-4 transition-all shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-700 font-extrabold flex items-center justify-center text-base shadow-inner shrink-0">
                        {member.user.name.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="font-extrabold text-slate-900 truncate flex items-center gap-2">
                          {member.user.name}
                          {isTargetSelf && (
                            <span className="text-[10px] font-bold bg-slate-200/70 text-slate-600 px-2 py-0.5 rounded-full">
                              You
                            </span>
                          )}
                        </p>
                        <p className="text-xs font-medium text-slate-500 truncate flex items-center gap-1 mt-0.5">
                          <Mail className="w-3.5 h-3.5" /> {member.user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                      {/* Role control column: fixed width w-28 so all rows align perfectly */}
                      <div className="w-28 flex justify-end items-center">
                        {canModifyRole ? (
                          <div className="relative w-full">
                            <select
                              value={member.role}
                              disabled={updatingUserId === member.userId}
                              onChange={(e) => handleRoleChange(member.userId, e.target.value)}
                              className="w-full px-3 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-white text-xs font-black text-slate-700 cursor-pointer focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 shadow-xs appearance-none pr-7 text-center"
                            >
                              <option value="MEMBER">MEMBER</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <ChevronDown className="w-3.5 h-3.5 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                            {updatingUserId === member.userId && (
                              <Loader2 className="w-3.5 h-3.5 animate-spin absolute right-2.5 top-2.5 text-primary-500 pointer-events-none" />
                            )}
                          </div>
                        ) : (
                          getRoleBadge(member.role)
                        )}
                      </div>

                      {/* Action column: fixed width w-9 h-9 so buttons always align and spacing is preserved */}
                      <div className="w-9 h-9 flex items-center justify-center shrink-0">
                        {canRemove ? (
                          <button
                            onClick={() => handleRemoveMember(member.userId, member.user.name)}
                            className={`w-9 h-9 flex items-center justify-center rounded-xl transition-all cursor-pointer ${
                              isTargetSelf
                                ? "bg-rose-50 text-rose-600 hover:bg-rose-100"
                                : "text-slate-300 hover:text-rose-500 hover:bg-rose-50"
                            }`}
                            title={isTargetSelf ? "Leave Team" : "Remove Member"}
                          >
                            {isTargetSelf ? <LogOut className="w-4 h-4" /> : <Trash2 className="w-4 h-4" />}
                          </button>
                        ) : null}
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Invite Member Card (4 cols) */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sticky top-24">
            <h3 className="text-lg font-extrabold text-slate-900 flex items-center gap-2 mb-2">
              <Plus className="w-5 h-5 text-primary-500" />
              {t("inviteTeammate")}
            </h3>
            <p className="text-xs font-medium text-slate-500 mb-6">
              {t("inviteTeammateDesc")}
            </p>

            {canManageMembers ? (
              <form onSubmit={handleInvite} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                    {t("emailAddress")} <span className="text-primary-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    placeholder="colleague@example.com"
                    className="w-full px-4 py-3 text-sm font-semibold rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all shadow-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                    {t("initialRole")}
                  </label>
                  <select
                    value={newRole}
                    onChange={(e) => setNewRole(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-bold rounded-2xl border border-slate-200/80 bg-slate-50/50 hover:bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 transition-all shadow-xs cursor-pointer"
                  >
                    <option value="MEMBER">Member (Standard Access)</option>
                    <option value="ADMIN">Admin (Full Team & Member Management)</option>
                  </select>
                </div>

                <button
                  type="submit"
                  disabled={isInviting || !newEmail.trim()}
                  className="w-full py-3.5 rounded-full theme-gradient-btn text-white text-sm font-bold shadow-md shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isInviting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      {t("btnInviting")}
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 stroke-[3]" />
                      {t("btnSendInvite")}
                    </>
                  )}
                </button>
              </form>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center">
                <AlertCircle className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-bold text-slate-700">{t("roleMember")}</p>
                <p className="text-[11px] text-slate-500 mt-1">
                  {t("inviteTeammateDesc")}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
