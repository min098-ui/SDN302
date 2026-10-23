"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import {
  Loader2,
  ArrowLeft,
  Plus,
  Users,
  Trash2,
  ListChecks,
  Shield,
  Crown,
  Mail,
  CircleDashed,
  Clock,
  CheckCircle2,
  Sparkles,
  Layout,
  UsersRound,
  Pencil,
  X,
  Check,
  Kanban,
  List,
  Search,
  MessageSquare,
  History,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";
import { useRealtimeSubscription } from "@/lib/realtimeClient";
import TeamChat from "@/components/TeamChat";
import TeamMemberManager from "@/components/TeamMemberManager";
import TeamActivityLog from "@/components/TeamActivityLog";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const [team, setTeam] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tab State
  const [activeTab, setActiveTab] = useState<"board" | "chat" | "members" | "activity">("board");

  // New Task State
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDesc, setNewTaskDesc] = useState("");
  const [newTaskStatus, setNewTaskStatus] = useState("TODO");
  const [newTaskPriority, setNewTaskPriority] = useState("MEDIUM");
  const [newTaskAssignee, setNewTaskAssignee] = useState("");
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);

  // Edit Task State
  const [editingTaskId, setEditingTaskId] = useState<string | null>(null);
  const [editTask, setEditTask] = useState({
    title: "",
    description: "",
    status: "",
    priority: "",
    assigneeId: "",
  });

  // View Mode State
  const [viewMode, setViewMode] = useState<"board" | "list">("board");

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");

  // Edit/Delete Team State
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamDesc, setEditTeamDesc] = useState("");
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);

  const currentUserId = (session?.user as any)?.id;
  const isOwner = team?.ownerId === currentUserId;
  const currentMembership = team?.members?.find((m: any) => m.userId === currentUserId);
  const currentUserRole = isOwner ? "OWNER" : currentMembership?.role || "MEMBER";
  const isAdmin = currentUserRole === "ADMIN";
  const canManageAllTasks = isOwner || isAdmin;

  // Real-time updates subscription for the team
  const { isConnected, provider } = useRealtimeSubscription({
    channel: teamId ? `team-${teamId}` : null,
    onEvent: (event, data) => {
      if (event === "task:created" && data) {
        setTasks((prev) => {
          if (prev.some((t) => t.id === data.id)) return prev;
          return [data, ...prev];
        });
      } else if (event === "task:updated" && data) {
        setTasks((prev) => prev.map((t) => (t.id === data.id ? data : t)));
      } else if (event === "task:deleted" && data) {
        setTasks((prev) => prev.filter((t) => t.id !== data.taskId));
      } else if (
        event === "member:added" ||
        event === "member:removed" ||
        event === "member:role_updated" ||
        event === "team:updated"
      ) {
        fetchTeamData();
      } else if (event === "team:deleted") {
        toast.error("This team was deleted by the owner");
        router.push("/teams");
      }
    },
  });

  useEffect(() => {
    if (team) {
      setEditTeamName(team.name);
      setEditTeamDesc(team.description || "");
    }
  }, [team, isEditTeamOpen]);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchTeamData();
    }
  }, [status, teamId]);

  async function fetchTeamData() {
    try {
      const [teamRes, tasksRes] = await Promise.all([
        fetch(`/api/teams/${teamId}`),
        fetch(`/api/teams/${teamId}/tasks`),
      ]);

      if (teamRes.ok && tasksRes.ok) {
        const teamData = await teamRes.json();
        const tasksData = await tasksRes.json();
        setTeam(teamData);
        setTasks(tasksData);
      } else {
        toast.error("Failed to load team data. You might not have access.");
        router.push("/teams");
      }
    } catch {
      toast.error("Error loading data");
    } finally {
      setIsLoading(false);
    }
  }

  const filteredTasks = tasks.filter((task) => {
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    if (filterStatus !== "ALL" && task.status !== filterStatus) return false;
    if (filterPriority !== "ALL" && task.priority !== filterPriority) return false;
    if (filterAssignee !== "ALL" && (task.assigneeId || "") !== filterAssignee) return false;
    return true;
  });

  // Kanban Drag and Drop Handlers
  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData("taskId", taskId);
  };

  const handleDrop = (e: React.DragEvent, newStatus: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData("taskId");
    if (taskId) {
      updateTaskStatus(taskId, newStatus);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingTask(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/tasks`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTaskTitle,
          description: newTaskDesc,
          status: newTaskStatus,
          priority: newTaskPriority,
          assigneeId: newTaskAssignee || null,
        }),
      });
      if (res.ok) {
        const createdTask = await res.json();
        // Optimistically update
        setTasks((prev) => {
          if (prev.some((t) => t.id === createdTask.id)) return prev;
          return [createdTask, ...prev];
        });
        toast.success("Task created");
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskAssignee("");
        setIsAddTaskOpen(false);
      } else {
        toast.error("Failed to create task");
      }
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        setTasks((prev) => prev.filter((t) => t.id !== taskId));
        toast.success("Task deleted");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete task");
      }
    } catch {
      toast.error("Error deleting task");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    // Optimistic UI update
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        toast.error("Failed to update status");
        fetchTeamData();
      }
    } catch {
      toast.error("Error updating status");
      fetchTeamData();
    }
  };

  const handleEditTask = async (e: React.FormEvent, taskId: string) => {
    e.preventDefault();
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editTask),
      });
      if (res.ok) {
        const updated = await res.json();
        setTasks((prev) => prev.map((t) => (t.id === taskId ? updated : t)));
        toast.success("Task updated!");
        setEditingTaskId(null);
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to update task");
      }
    } catch {
      toast.error("Error updating task");
    }
  };

  const handleEditTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditingTeam(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: editTeamName, description: editTeamDesc }),
      });
      if (res.ok) {
        toast.success("Team updated successfully!");
        setIsEditTeamOpen(false);
        fetchTeamData();
      } else {
        toast.error("Failed to update team");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsEditingTeam(false);
    }
  };

  const handleDeleteTeam = async () => {
    setIsDeletingTeam(true);
    try {
      const res = await fetch(`/api/teams/${teamId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Team deleted successfully!");
        router.push("/teams");
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete team");
      }
    } catch {
      toast.error("An error occurred");
    } finally {
      setIsDeletingTeam(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE":
        return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "IN_PROGRESS":
        return <Clock className="w-4 h-4 text-amber-500" />;
      default:
        return <CircleDashed className="w-4 h-4 text-slate-400" />;
    }
  };

  if (isLoading || status === "loading") {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-50">
        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
      </div>
    );
  }

  if (!team) return null;

  const renderTask = (task: any) => {
    const isAssignee = task.assigneeId === currentUserId;
    const canEditOrDelete = canManageAllTasks || isAssignee;

    return (
      <div
        draggable
        onDragStart={(e) => handleDragStart(e, task.id)}
        key={task.id}
        className="group border border-slate-200/80 hover:border-primary-300 rounded-3xl p-6 hover:shadow-xl hover:shadow-primary-500/10 bg-white flex flex-col gap-4 transition-all duration-300"
      >
        {editingTaskId === task.id ? (
          /* Inline Edit Form */
          <form onSubmit={(e) => handleEditTask(e, task.id)} className="space-y-3">
            <input
              value={editTask.title}
              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-semibold text-slate-900 bg-slate-50"
              placeholder="Task title"
              required
            />
            <input
              value={editTask.description}
              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm text-slate-700 bg-slate-50"
              placeholder="Description (optional)"
            />
            <div className="flex flex-wrap gap-2">
              <select
                value={editTask.status}
                onChange={(e) => setEditTask({ ...editTask, status: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
              <select
                value={editTask.priority}
                onChange={(e) => setEditTask({ ...editTask, priority: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
              <select
                value={editTask.assigneeId}
                onChange={(e) => setEditTask({ ...editTask, assigneeId: e.target.value })}
                className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-bold text-slate-700 appearance-none cursor-pointer focus:outline-none"
              >
                <option value="">Unassigned</option>
                <option value={team.owner.id}>{team.owner.name} (Owner)</option>
                {team.members.map((m: any) => (
                  <option key={m.user.id} value={m.user.id}>
                    {m.user.name} ({m.role})
                  </option>
                ))}
              </select>
            </div>
            <div className="flex gap-2 pt-1">
              <button
                type="submit"
                className="flex items-center gap-1.5 px-4 py-2 rounded-full theme-gradient-btn text-white text-xs font-bold shadow-sm transition-all cursor-pointer"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" /> Save
              </button>
              <button
                type="button"
                onClick={() => setEditingTaskId(null)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all cursor-pointer"
              >
                <X className="w-3.5 h-3.5" /> Cancel
              </button>
            </div>
          </form>
        ) : (
          /* Normal View */
          <div className="flex flex-col justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-4 mb-2">
                <h3
                  className={`font-black text-base truncate ${
                    task.status === "DONE" ? "line-through text-slate-400" : "text-slate-800"
                  }`}
                >
                  {task.title}
                </h3>
                <div className="flex items-center gap-1">
                  {canEditOrDelete ? (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                          setEditingTaskId(task.id);
                          setEditTask({
                            title: task.title,
                            description: task.description || "",
                            status: task.status,
                            priority: task.priority,
                            assigneeId: task.assigneeId || "",
                          });
                        }}
                        className="text-slate-400 hover:text-primary-600 hover:bg-primary-50 p-2 rounded-xl transition-colors shadow-xs"
                        title="Edit Task"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="text-slate-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-xl transition-colors shadow-xs"
                        title="Delete Task"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <span
                      title="Only Owner, Admin, or Assignee can modify"
                      className="text-slate-300 p-1"
                    >
                      <Lock className="w-3.5 h-3.5" />
                    </span>
                  )}
                </div>
              </div>

              {task.description && (
                <p className="text-xs font-medium text-slate-500 mb-4 line-clamp-2 leading-relaxed">
                  {task.description}
                </p>
              )}

              <div className="flex flex-wrap items-center gap-2 text-xs font-bold">
                {/* Status selector */}
                <div className="relative group/select">
                  <div className="absolute inset-y-0 left-2.5 flex items-center pointer-events-none">
                    {getStatusIcon(task.status)}
                  </div>
                  <select
                    value={task.status}
                    onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                    className="pl-8 pr-7 py-1.5 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-slate-100 focus:ring-2 focus:ring-primary-500 appearance-none transition-colors cursor-pointer text-slate-700 shadow-xs text-xs font-extrabold"
                  >
                    <option value="TODO">To Do</option>
                    <option value="IN_PROGRESS">In Progress</option>
                    <option value="DONE">Done</option>
                  </select>
                </div>

                {/* Priority Badge */}
                <span
                  className={`px-3 py-1.5 rounded-xl border text-[11px] font-black shadow-xs ${
                    task.priority === "HIGH"
                      ? "bg-rose-50 text-rose-700 border-rose-100"
                      : task.priority === "MEDIUM"
                      ? "bg-amber-50 text-amber-700 border-amber-100"
                      : "bg-slate-50 text-slate-600 border-slate-200"
                  }`}
                >
                  {task.priority}
                </span>

                {/* Assignee Badge */}
                {task.assignee ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 text-[11px] font-bold shadow-xs">
                    <div className="w-4 h-4 rounded-full bg-primary-200 flex items-center justify-center text-[9px] font-black">
                      {task.assignee.name.charAt(0).toUpperCase()}
                    </div>
                    {task.assignee.name}
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-slate-100 text-slate-400 text-[10px] font-bold">
                    Unassigned
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-8 space-y-8 animate-in fade-in duration-500">
      {/* Back Button */}
      <Link
        href="/teams"
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-xs group w-fit"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        All Teams
      </Link>

      {/* Hero Banner */}
      <section className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-2xl p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-gradient-to-br from-primary-500/20 via-secondary-500/10 to-transparent blur-[70px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="flex flex-wrap items-center gap-3 mb-4">
              {/* Workspace Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-primary-300 text-xs font-bold border border-white/20 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="tracking-widest uppercase text-[10px]">Team Hub</span>
              </div>

              {/* User Role Badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white text-xs font-black border border-white/20 backdrop-blur-md">
                {isOwner ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                ) : isAdmin ? (
                  <Shield className="w-3.5 h-3.5 text-indigo-400" />
                ) : (
                  <Users className="w-3.5 h-3.5 text-slate-300" />
                )}
                <span>{t("yourCurrentRole")} {currentUserRole}</span>
              </div>

              {/* Real-time Indicator Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 text-emerald-300 text-xs font-bold border border-emerald-500/30 backdrop-blur-md">
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <span>{isConnected ? `${t("chatConnected")}: ${provider.toUpperCase()}` : t("connecting")}</span>
              </div>

              {/* Team Settings / Delete Buttons (Owner / Admin) */}
              {(isOwner || isAdmin) && (
                <div className="flex items-center gap-2 ml-2">
                  <button
                    onClick={() => setIsEditTeamOpen(true)}
                    className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10 cursor-pointer"
                    title="Edit Team Settings"
                  >
                    <Pencil className="w-4 h-4" />
                  </button>
                  {isOwner && (
                    <button
                      onClick={() => setIsDeleteTeamOpen(true)}
                      className="p-2 rounded-xl bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 transition-colors border border-rose-500/30 cursor-pointer"
                      title="Delete Team (Owner Only)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              )}
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-3 flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-300">
                {team.name}
              </span>
            </h1>
            {team.description && (
              <p className="text-slate-300 text-base max-w-xl font-medium leading-relaxed">
                {team.description}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[130px] shadow-inner">
              <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-1">
                {t("filterMembers")}
              </p>
              <p className="text-3xl font-black">
                {team.members.filter((m: any) => m.user.id !== team.owner.id).length + 1}
              </p>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[130px] shadow-inner">
              <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-1">
                {t("filterTasks")}
              </p>
              <p className="text-3xl font-black">{tasks.length}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200/80 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab("board")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "board"
              ? "theme-gradient-btn text-white shadow-md shadow-primary-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <Kanban className="w-4 h-4" />
          {t("tabBoard")}
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "chat"
              ? "theme-gradient-btn text-white shadow-md shadow-primary-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          {t("tabChat")}
        </button>

        <button
          onClick={() => setActiveTab("members")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "members"
              ? "theme-gradient-btn text-white shadow-md shadow-primary-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <UsersRound className="w-4 h-4" />
          {t("tabMembers")}
        </button>

        <button
          onClick={() => setActiveTab("activity")}
          className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-black text-sm transition-all cursor-pointer whitespace-nowrap ${
            activeTab === "activity"
              ? "theme-gradient-btn text-white shadow-md shadow-primary-500/20"
              : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
          }`}
        >
          <History className="w-4 h-4" />
          {t("tabActivity")}
        </button>
      </div>

      {/* Tab 1: Task Board (Kanban & List) */}
      {activeTab === "board" && (
        <div className="space-y-6">
          <div className="bg-white rounded-[2.5rem] border border-slate-200/80 p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)]">
            <div className="flex flex-col gap-5 mb-8">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-black text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  {t("teamTasks")}
                </h2>

                <div className="flex bg-slate-100/80 p-1 rounded-2xl border border-slate-200/50">
                  <button
                    onClick={() => setViewMode("board")}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
                      viewMode === "board"
                        ? "theme-gradient-btn text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <Kanban className="w-4 h-4" /> Kanban Board
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`px-4 py-2 rounded-xl transition-all flex items-center gap-2 text-xs font-bold cursor-pointer ${
                      viewMode === "list"
                        ? "theme-gradient-btn text-white shadow-sm"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    <List className="w-4 h-4" /> List View
                  </button>
                </div>
              </div>

              {/* Filters Bar */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-50/80 p-3 rounded-2xl border border-slate-200/60">
                <div className="relative flex-1 min-w-[200px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search tasks..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-medium text-slate-700 bg-white shadow-xs"
                  />
                </div>
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-700 appearance-none cursor-pointer focus:outline-none shadow-xs min-w-[130px]"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <select
                  value={filterPriority}
                  onChange={(e) => setFilterPriority(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-700 appearance-none cursor-pointer focus:outline-none shadow-xs min-w-[130px]"
                >
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
                <select
                  value={filterAssignee}
                  onChange={(e) => setFilterAssignee(e.target.value)}
                  className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-xs font-extrabold text-slate-700 appearance-none cursor-pointer focus:outline-none shadow-xs min-w-[130px]"
                >
                  <option value="ALL">All Assignees</option>
                  <option value={team.owner.id}>{team.owner.name} (Owner)</option>
                  {team.members.map((m: any) => (
                    <option key={m.user.id} value={m.user.id}>
                      {m.user.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {filteredTasks.length === 0 ? (
              <div className="text-center py-16 px-4 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50">
                <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-xs border border-slate-100">
                  <ListChecks className="w-8 h-8 text-slate-300" />
                </div>
                <h3 className="font-black text-slate-700 text-lg mb-1">No tasks found</h3>
                <p className="text-xs font-medium text-slate-500 max-w-sm mx-auto">
                  Try adjusting your filters or create a new task below.
                </p>
              </div>
            ) : viewMode === "board" ? (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 overflow-x-auto pb-4">
                {["TODO", "IN_PROGRESS", "DONE"].map((colStatus) => (
                  <div
                    key={colStatus}
                    onDrop={(e) => handleDrop(e, colStatus)}
                    onDragOver={handleDragOver}
                    className="bg-slate-50/60 rounded-[2rem] p-5 border border-slate-200/60 min-w-[280px]"
                  >
                    <h3 className="font-extrabold text-slate-700 mb-4 flex items-center justify-between">
                      <span className="flex items-center gap-2">
                        {getStatusIcon(colStatus)}
                        {colStatus === "TODO"
                          ? "To Do"
                          : colStatus === "IN_PROGRESS"
                          ? "In Progress"
                          : "Done"}
                      </span>
                      <span className="bg-white px-2.5 py-1 rounded-full text-xs font-black shadow-xs text-slate-500 border border-slate-200/50">
                        {filteredTasks.filter((t) => t.status === colStatus).length}
                      </span>
                    </h3>
                    <div className="space-y-4 min-h-[160px]">
                      {filteredTasks
                        .filter((t) => t.status === colStatus)
                        .map((task) => renderTask(task))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredTasks.map((task) => renderTask(task))}
              </div>
            )}

            {/* Create Task Button + Collapsible Form */}
            <div className="mt-8 pt-8 border-t border-slate-100">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-700 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary-500 stroke-[3]" />
                  Add New Task
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(!isAddTaskOpen)}
                  className="px-5 py-2.5 rounded-full theme-gradient-btn active:scale-95 text-white text-xs font-bold shadow-md shadow-primary-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  {isAddTaskOpen ? "Close Form" : "Create Task"}
                </button>
              </div>

              {isAddTaskOpen && (
                <form
                  onSubmit={handleAddTask}
                  className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/70 p-6 rounded-3xl border border-slate-200/80 animate-in fade-in duration-200"
                >
                  <div className="md:col-span-12 space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                      Task Title <span className="text-primary-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="What needs to be done?"
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-semibold text-slate-900 shadow-xs"
                    />
                  </div>
                  <div className="md:col-span-12 space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                      Description <span className="text-slate-400 normal-case">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="Additional details..."
                      value={newTaskDesc}
                      onChange={(e) => setNewTaskDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-semibold text-slate-900 shadow-xs"
                    />
                  </div>
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                      Assignee
                    </label>
                    <select
                      value={newTaskAssignee}
                      onChange={(e) => setNewTaskAssignee(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 appearance-none text-sm shadow-xs cursor-pointer focus:outline-none"
                    >
                      <option value="">Unassigned</option>
                      <option value={team.owner.id}>{team.owner.name} (Owner)</option>
                      {team.members.map((m: any) => (
                        <option key={m.user.id} value={m.user.id}>
                          {m.user.name} ({m.role})
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">
                      {t("labelPriority")}
                    </label>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 appearance-none text-sm shadow-xs cursor-pointer focus:outline-none"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 flex items-end">
                    <button
                      type="submit"
                      disabled={isAddingTask}
                      className="w-full py-3.5 rounded-full theme-gradient-btn text-white font-bold shadow-md shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 text-sm cursor-pointer"
                    >
                      {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Task"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Team Chat */}
      {activeTab === "chat" && (
        <TeamChat teamId={team.id} teamName={team.name} />
      )}

      {/* Tab 3: Members & Role Management */}
      {activeTab === "members" && (
        <TeamMemberManager
          team={team}
          currentUserId={currentUserId}
          onRefresh={fetchTeamData}
        />
      )}

      {/* Tab 4: Team Activity Audit Log */}
      {activeTab === "activity" && (
        <TeamActivityLog teamId={team.id} />
      )}

      {/* Edit Team Modal */}
      {isEditTeamOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditTeamOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsEditTeamOpen(false)}
              className="absolute top-6 right-6 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6">
              <Pencil className="w-5 h-5 text-primary-500" />
              Edit Team Settings
            </h2>

            <form onSubmit={handleEditTeam} className="space-y-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                  Team Name <span className="text-primary-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-bold text-slate-900 shadow-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={editTeamDesc}
                  onChange={(e) => setEditTeamDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 bg-slate-50 focus:bg-white focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-semibold text-slate-900 shadow-xs resize-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditTeamOpen(false)}
                  className="flex-1 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isEditingTeam}
                  className="flex-1 py-3 rounded-full theme-gradient-btn text-white font-bold text-sm shadow-md shadow-primary-500/20 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
                >
                  {isEditingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Team Confirmation Modal */}
      {isDeleteTeamOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsDeleteTeamOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[2.5rem] p-8 shadow-2xl border border-slate-100 animate-in zoom-in-95 duration-200">
            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-3">
              <Trash2 className="w-5 h-5 text-rose-500" />
              Delete Team Permanently
            </h2>
            <p className="text-xs font-medium text-slate-500 leading-relaxed mb-6">
              Are you sure you want to delete <span className="font-bold text-slate-800">&quot;{team.name}&quot;</span>? All tasks, messages, and member associations will be deleted permanently.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setIsDeleteTeamOpen(false)}
                className="flex-1 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold text-sm transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteTeam}
                disabled={isDeletingTeam}
                className="flex-1 py-3 rounded-full bg-rose-500 hover:bg-rose-600 active:scale-95 text-white font-bold text-sm shadow-md shadow-rose-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 cursor-pointer"
              >
                {isDeletingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : "Delete Team"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
