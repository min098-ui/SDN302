"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { Loader2, ArrowLeft, Plus, Users, Trash2, ListChecks, Shield, Mail, CircleDashed, Clock, CheckCircle2, Sparkles, Layout, UsersRound, Pencil, X, Check, LayoutGrid, List, Kanban, Search, Filter } from "lucide-react";
import Link from "next/link";
import { useLanguage } from "@/lib/languageContext";

export default function TeamDetailPage() {
  const params = useParams();
  const teamId = params.id as string;
  const { data: session, status } = useSession();
  const router = useRouter();
  const { t } = useLanguage();

  const [team, setTeam] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // New Member State
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [newMemberRole, setNewMemberRole] = useState("MEMBER");
  const [isAddingMember, setIsAddingMember] = useState(false);

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
  const [editTask, setEditTask] = useState({ title: "", description: "", status: "", priority: "", assigneeId: "" });

  // View Mode State
  const [viewMode, setViewMode] = useState<'board' | 'list'>('board');

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [filterAssignee, setFilterAssignee] = useState("ALL");

  const filteredTasks = tasks.filter(task => {
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

  // Edit/Delete Team State
  const [isEditTeamOpen, setIsEditTeamOpen] = useState(false);
  const [editTeamName, setEditTeamName] = useState("");
  const [editTeamDesc, setEditTeamDesc] = useState("");
  const [isEditingTeam, setIsEditingTeam] = useState(false);
  const [isDeleteTeamOpen, setIsDeleteTeamOpen] = useState(false);
  const [isDeletingTeam, setIsDeletingTeam] = useState(false);

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

  const fetchTeamData = async () => {
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
        router.push("/dashboard");
      }
    } catch (error) {
      toast.error("Error loading data");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsAddingMember(true);
    try {
      const res = await fetch(`/api/teams/${teamId}/members`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: newMemberEmail, role: newMemberRole }),
      });
      if (res.ok) {
        toast.success("Member added");
        setNewMemberEmail("");
        fetchTeamData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to add member");
      }
    } finally {
      setIsAddingMember(false);
    }
  };

  const handleRemoveMember = async (userId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return;
    try {
      const res = await fetch(`/api/teams/${teamId}/members/${userId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Member removed");
        fetchTeamData();
      } else {
        toast.error("Failed to remove member");
      }
    } catch (error) {
      toast.error("Error removing member");
    }
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
        toast.success("Task created");
        setNewTaskTitle("");
        setNewTaskDesc("");
        setNewTaskAssignee("");
        setIsAddTaskOpen(false);
        fetchTeamData();
      } else {
        toast.error("Failed to create task");
      }
    } finally {
      setIsAddingTask(false);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Delete this task?")) return;
    try {
      const res = await fetch(`/api/tasks/${taskId}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Task deleted");
        fetchTeamData();
      } else {
        const data = await res.json();
        toast.error(data.error || "Failed to delete task");
      }
    } catch (error) {
      toast.error("Error deleting task");
    }
  };

  const updateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/tasks/${taskId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) fetchTeamData();
      else toast.error("Failed to update status");
    } catch (error) {
      toast.error("Error updating status");
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
        toast.success("Task updated!");
        setEditingTaskId(null);
        fetchTeamData();
      } else toast.error("Failed to update task");
    } catch {
      toast.error("Error updating task");
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

  const currentUserId = (session?.user as any)?.id;
  const isOwner = currentUserId === team.ownerId;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "DONE": return <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
      case "IN_PROGRESS": return <Clock className="w-4 h-4 text-amber-500" />;
      default: return <CircleDashed className="w-4 h-4 text-slate-400" />;
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
    } catch (error) {
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
        toast.error("Failed to delete team");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setIsDeletingTeam(false);
    }
  };

  const renderTask = (task: any) => (
                  <div draggable onDragStart={(e) => handleDragStart(e, task.id)} key={task.id} className="group border border-slate-200/70 hover:border-primary-300 rounded-2xl p-6 hover:shadow-xl hover:shadow-primary-500/10 bg-white flex flex-col gap-4 transition-all duration-300">
                    {editingTaskId === task.id ? (
                      /* Inline Edit Form */
                      <form onSubmit={(e) => handleEditTask(e, task.id)} className="space-y-3">
                        <input
                          value={editTask.title}
                          onChange={e => setEditTask({...editTask, title: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-semibold text-slate-900 bg-slate-50"
                          placeholder="Task title"
                          required
                        />
                        <input
                          value={editTask.description}
                          onChange={e => setEditTask({...editTask, description: e.target.value})}
                          className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm text-slate-700 bg-slate-50"
                          placeholder="Description (optional)"
                        />
                        <div className="flex gap-3">
                          <select value={editTask.status} onChange={e => setEditTask({...editTask, status: e.target.value})} className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 appearance-none cursor-pointer focus:outline-none">
                            <option value="TODO">To Do</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="DONE">Done</option>
                          </select>
                          <select value={editTask.priority} onChange={e => setEditTask({...editTask, priority: e.target.value})} className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 appearance-none cursor-pointer focus:outline-none">
                            <option value="LOW">Low</option>
                            <option value="MEDIUM">Medium</option>
                            <option value="HIGH">High</option>
                          </select>
                          <select value={editTask.assigneeId} onChange={e => setEditTask({...editTask, assigneeId: e.target.value})} className="flex-1 px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-sm font-semibold text-slate-700 appearance-none cursor-pointer focus:outline-none">
                            <option value="">Unassigned</option>
                            <option value={team.owner.id}>{team.owner.name}</option>
                            {team.members.map((m: any) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                          </select>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button type="submit" className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-sm transition-all">
                            <Check className="w-3.5 h-3.5 stroke-[3]" /> Save
                          </button>
                          <button type="button" onClick={() => setEditingTaskId(null)} className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold transition-all">
                            <X className="w-3.5 h-3.5" /> Cancel
                          </button>
                        </div>
                      </form>
                    ) : (
                      /* Normal View */
                      <div className="flex flex-col md:flex-row justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-4 mb-3">
                            <h3 className={`font-extrabold text-lg truncate ${task.status === 'DONE' ? 'line-through text-slate-400' : 'text-slate-800'}`}>
                              {task.title}
                            </h3>
                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                              {(isOwner || task.assigneeId === currentUserId) && (
                                <>
                                  <button 
                                    onClick={() => { setEditingTaskId(task.id); setEditTask({ title: task.title, description: task.description || "", status: task.status, priority: task.priority, assigneeId: task.assigneeId || "" }); }}
                                    className="text-slate-300 hover:text-primary-500 hover:bg-primary-50 p-2 rounded-xl transition-colors shadow-sm"
                                    title="Edit Task"
                                  >
                                    <Pencil className="w-4 h-4" />
                                  </button>
                                  <button 
                                    onClick={() => handleDeleteTask(task.id)}
                                    className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl transition-colors shadow-sm"
                                    title="Delete Task"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {task.description && (
                            <p className="text-sm font-medium text-slate-500 mb-5 line-clamp-2 leading-relaxed">{task.description}</p>
                          )}
                          
                          <div className="flex flex-wrap items-center gap-3 text-xs font-bold">
                            <div className="relative group/select">
                              <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                                {getStatusIcon(task.status)}
                              </div>
                              <select 
                                value={task.status} 
                                onChange={(e) => updateTaskStatus(task.id, e.target.value)}
                                disabled={!(isOwner || task.assigneeId === currentUserId)}
                                className="pl-9 pr-8 py-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 focus:ring-2 focus:ring-primary-500 appearance-none transition-colors cursor-pointer disabled:cursor-not-allowed disabled:opacity-70 text-slate-700 shadow-sm"
                              >
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="DONE">Done</option>
                              </select>
                            </div>

                            <span className={`px-4 py-2.5 rounded-xl border shadow-sm ${
                              task.priority === 'HIGH' ? 'bg-rose-50 text-rose-700 border-rose-100' : 
                              task.priority === 'MEDIUM' ? 'bg-amber-50 text-amber-700 border-amber-100' : 'bg-slate-50 text-slate-600 border-slate-200'
                            }`}>
                              {task.priority} Priority
                            </span>

                            {task.assignee && (
                              <span className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary-50 text-primary-700 border border-primary-100 shadow-sm">
                                <div className="w-5 h-5 rounded-full bg-primary-200 flex items-center justify-center text-[10px] font-black">
                                  {task.assignee.name.charAt(0).toUpperCase()}
                                </div>
                                {task.assignee.name}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
  );

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 space-y-8 animate-in fade-in duration-500">
      
      {/* Back Button */}
      <Link href="/teams" className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-slate-200 text-sm font-bold text-slate-600 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-all shadow-sm group w-fit">
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        All Teams
      </Link>
      
      {/* Premium Dark Hero Banner (Matched with Dashboard) */}
      <section className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700 shadow-2xl p-8 md:p-12 text-white">
        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-gradient-to-br from-primary-500/20 via-secondary-500/10 to-transparent blur-[60px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[300px] h-[300px] bg-gradient-to-tr from-primary-500/10 to-secondary-500/5 blur-[50px] rounded-full translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-end justify-between gap-8">
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-primary-300 text-xs font-bold border border-white/20 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" />
                <span className="tracking-widest uppercase text-[10px]">Team Workspace</span>
              </div>
              {isOwner && (
                <div className="flex items-center gap-2">
                  <button onClick={() => setIsEditTeamOpen(true)} className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors border border-white/10" title="Edit Team">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => setIsDeleteTeamOpen(true)} className="p-1.5 rounded-lg bg-rose-500/20 hover:bg-rose-500/40 text-rose-200 transition-colors border border-rose-500/30" title="Delete Team">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
            <h1 className="text-4xl sm:text-5xl font-black text-white tracking-tight mb-4 flex items-center gap-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-secondary-300">{team.name}</span>
            </h1>
            {team.description && (
              <p className="text-slate-300 text-lg max-w-xl font-medium leading-relaxed">
                {team.description}
              </p>
            )}
          </div>
          
          <div className="flex flex-wrap gap-4 shrink-0">
            <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[140px] shadow-inner">
              <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-1.5">Total Members</p>
              <p className="text-3xl font-black">{team.members.filter((m: any) => m.user.id !== team.owner.id).length + 1}</p>
            </div>
            <div className="px-6 py-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 text-center min-w-[140px] shadow-inner">
              <p className="text-[10px] font-bold text-primary-200 uppercase tracking-widest mb-1.5">Active Tasks</p>
              <p className="text-3xl font-black">{tasks.length}</p>
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Content: Tasks (8 columns) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-8 md:p-10 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative overflow-hidden">
            <div className="flex flex-col gap-5 mb-8 relative z-10">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-extrabold text-slate-900 flex items-center gap-3">
                  <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
                    <ListChecks className="w-5 h-5" />
                  </div>
                  {t("teamTasks")}
                </h2>
                
                <div className="flex bg-slate-100/80 p-1 rounded-xl border border-slate-200/50 shadow-inner">
                  <button 
                    onClick={() => setViewMode('board')}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'board' ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
                  >
                    <Kanban className="w-4 h-4" /> Kanban Board
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`px-4 py-2 rounded-lg transition-all flex items-center gap-2 text-sm font-bold ${viewMode === 'list' ? 'bg-gradient-to-r from-primary-500 to-secondary-500 text-white shadow-md' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'}`}
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
                    className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-200 focus:outline-none focus:border-primary-400 focus:ring-4 focus:ring-primary-100 text-sm font-medium text-slate-700 bg-white shadow-sm"
                  />
                </div>
                <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 appearance-none cursor-pointer focus:outline-none shadow-sm min-w-[140px]">
                  <option value="ALL">All Statuses</option>
                  <option value="TODO">To Do</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="DONE">Done</option>
                </select>
                <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 appearance-none cursor-pointer focus:outline-none shadow-sm min-w-[140px]">
                  <option value="ALL">All Priorities</option>
                  <option value="LOW">Low Priority</option>
                  <option value="MEDIUM">Medium Priority</option>
                  <option value="HIGH">High Priority</option>
                </select>
                <select value={filterAssignee} onChange={e => setFilterAssignee(e.target.value)} className="px-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-slate-600 appearance-none cursor-pointer focus:outline-none shadow-sm min-w-[140px]">
                  <option value="ALL">All Assignees</option>
                  <option value={team.owner.id}>{team.owner.name}</option>
                  {team.members.map((m: any) => <option key={m.user.id} value={m.user.id}>{m.user.name}</option>)}
                </select>
              </div>
            </div>
            
            
            {filteredTasks.length === 0 ? (
                <div className="text-center py-16 px-4 rounded-[2rem] border-2 border-dashed border-slate-200 bg-slate-50/50 relative z-10">
                  <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-5 shadow-sm border border-slate-100">
                    <ListChecks className="w-10 h-10 text-slate-300" />
                  </div>
                  <h3 className="font-black text-slate-700 text-xl mb-2">No tasks found</h3>
                  <p className="text-sm font-medium text-slate-500 max-w-sm mx-auto">Try adjusting your filters or create a new task.</p>
                </div>
              ) : viewMode === 'board' ? (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 relative z-10 overflow-x-auto pb-4">
                  {['TODO', 'IN_PROGRESS', 'DONE'].map(status => (
                     <div key={status} onDrop={(e) => handleDrop(e, status)} onDragOver={handleDragOver} className="bg-slate-50/50 rounded-[2rem] p-5 border border-slate-200/60 min-w-[280px]">
                        <h3 className="font-bold text-slate-700 mb-4 flex items-center justify-between">
                           <span className="flex items-center gap-2">
                             {getStatusIcon(status)}
                             {status === 'TODO' ? 'To Do' : status === 'IN_PROGRESS' ? 'In Progress' : 'Done'}
                           </span>
                           <span className="bg-white px-2.5 py-1 rounded-full text-xs font-black shadow-sm text-slate-500 border border-slate-200/50">
                             {filteredTasks.filter(t => t.status === status).length}
                           </span>
                        </h3>
                        <div className="space-y-4 min-h-[150px]">
                          {filteredTasks.filter(t => t.status === status).map(task => renderTask(task))}
                        </div>
                     </div>
                  ))}
                </div>
              ) : (
                <div className="space-y-4 relative z-10">
                  {filteredTasks.map(task => renderTask(task))}
                </div>
              )}


            {/* Create Task Button + Collapsible Form */}
            <div className="mt-8 pt-8 border-t border-slate-100 relative z-10">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-black text-slate-700 flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary-500 stroke-[3]" />
                  Add New Task
                </h3>
                <button
                  type="button"
                  onClick={() => setIsAddTaskOpen(!isAddTaskOpen)}
                  className="px-5 py-2 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-95 text-white text-sm font-bold shadow-md shadow-primary-500/20 transition-all hover:-translate-y-0.5 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Create Task
                </button>
              </div>

              {isAddTaskOpen && (
                <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-12 gap-4 bg-slate-50/60 p-5 rounded-2xl border border-slate-200/60">
                  <div className="md:col-span-12 space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">Task Title <span className="text-primary-500">*</span></label>
                    <input 
                      type="text" required placeholder="What needs to be done?"
                      value={newTaskTitle} onChange={e => setNewTaskTitle(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-white transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-12 space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">Description <span className="text-slate-400 normal-case tracking-normal">(Optional)</span></label>
                    <input 
                      type="text" placeholder="Additional details..."
                      value={newTaskDesc} onChange={e => setNewTaskDesc(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-white transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal shadow-sm"
                    />
                  </div>
                  <div className="md:col-span-5 space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">Assignee</label>
                    <select 
                      value={newTaskAssignee} onChange={e => setNewTaskAssignee(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 bg-white cursor-pointer font-semibold text-slate-700 transition-all appearance-none text-sm shadow-sm"
                    >
                      <option value="">Unassigned</option>
                      <option value={team.owner.id}>{team.owner.name} (Owner)</option>
                      {team.members.map((m: any) => (
                        <option key={m.user.id} value={m.user.id}>{m.user.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="md:col-span-4 space-y-1.5">
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 ml-1">{t("labelPriority")}</label>
                    <select 
                      value={newTaskPriority} onChange={e => setNewTaskPriority(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 bg-white cursor-pointer font-semibold text-slate-700 transition-all appearance-none text-sm shadow-sm"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  <div className="md:col-span-3 flex items-end">
                    <button 
                      type="submit" disabled={isAddingTask}
                      className="w-full py-3 rounded-full bg-primary-500 hover:bg-primary-600 text-white font-bold shadow-md shadow-primary-500/20 transition-all active:scale-[0.98] hover:-translate-y-0.5 flex items-center justify-center gap-2 disabled:opacity-70 text-sm"
                    >
                      {isAddingTask ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar: Members (4 columns) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white/90 backdrop-blur-xl border border-slate-100 rounded-[2.5rem] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] sticky top-24 relative overflow-hidden">
            <div className="absolute -top-24 -right-24 w-56 h-56 bg-primary-400 rounded-full blur-[4rem] opacity-5 pointer-events-none" />

            <h2 className="text-xl font-extrabold text-slate-900 flex items-center gap-3 mb-8 relative z-10">
              <div className="p-2.5 bg-slate-900 text-white rounded-xl shadow-sm">
                <UsersRound className="w-5 h-5" />
              </div>
              {t("teamMembers")}
            </h2>
            
            <div className="space-y-4 relative z-10">
              {/* Owner Card */}
              <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-700 font-black border border-slate-200 shrink-0 shadow-inner">
                  {team.owner.name.charAt(0).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-extrabold text-slate-900 truncate">{team.owner.name}</p>
                  <p className="text-[11px] font-medium text-slate-500 truncate flex items-center gap-1 mt-0.5">
                    <Mail className="w-3.5 h-3.5" /> {team.owner.email}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-black text-amber-600 bg-amber-50 border border-amber-200 px-3 py-1.5 rounded-xl shadow-sm tracking-wider">
                    OWNER
                  </span>
                  {isOwner && (
                    <div className="w-8 h-8" aria-hidden="true" />
                  )}
                </div>
              </div>
              
              {/* Member Cards */}
              {team.members.filter((m: any) => m.user.id !== team.owner.id).map((m: any) => (
                <div key={m.id} className="group flex items-center gap-4 p-4 bg-white rounded-2xl border border-slate-200 shadow-sm hover:border-primary-300 hover:shadow-md transition-all">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-600 font-bold border border-slate-200 shrink-0 group-hover:bg-primary-50 group-hover:text-primary-600 group-hover:border-primary-200 transition-colors shadow-inner">
                    {m.user.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-extrabold text-slate-900 truncate group-hover:text-primary-600 transition-colors">{m.user.name}</p>
                    <p className="text-[11px] font-medium text-slate-500 truncate mt-0.5">{m.user.email}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-xl tracking-wider">
                      {m.role}
                    </span>
                    {isOwner && (
                      <button 
                        onClick={() => handleRemoveMember(m.user.id)} 
                        className="text-slate-300 hover:text-rose-500 hover:bg-rose-50 p-2 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"
                        title="Remove Member"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Invite Form */}
            {isOwner && (
              <div className="mt-10 pt-8 border-t border-slate-100 relative z-10">
                <h3 className="font-extrabold text-slate-800 mb-5 text-sm flex items-center gap-2">
                  <Plus className="w-4 h-4 text-primary-500 stroke-[3]" />
                  Invite Member
                </h3>
                <form onSubmit={handleAddMember} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">Email Address</label>
                    <input 
                      type="email" required placeholder="colleague@example.com"
                      value={newMemberEmail} onChange={e => setNewMemberEmail(e.target.value)}
                      className="w-full px-4 py-3 text-sm font-semibold rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all shadow-sm placeholder:font-normal"
                    />
                  </div>
                  <button 
                    type="submit" disabled={isAddingMember}
                    className="px-8 py-2.5 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white text-sm font-bold transition-all shadow-md shadow-primary-500/20 flex items-center justify-center gap-2 disabled:opacity-70 hover:-translate-y-0.5"
                  >
                    {isAddingMember ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                      <><Plus className="w-4 h-4 stroke-[3]" />Send Invitation</>
                    )}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Edit Team Modal */}
      {isEditTeamOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <div 
            className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={() => setIsEditTeamOpen(false)}
          />
          <div className="relative w-full max-w-md bg-white rounded-[2rem] p-6 sm:p-7 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.2)] border border-slate-100 animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setIsEditTeamOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>

            <h2 className="text-xl font-black text-slate-900 flex items-center gap-3 mb-6">
              <Pencil className="w-5 h-5 text-primary-500" />
              Edit Team
            </h2>
            
            <form onSubmit={handleEditTeam} className="space-y-5">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                  {t("teamName")} <span className="text-primary-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editTeamName}
                  onChange={(e) => setEditTeamName(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium shadow-sm"
                  placeholder={t("teamNamePlaceholder")}
                />
              </div>
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-widest text-slate-500 mb-1.5 ml-1">
                  {t("descOptional")}
                </label>
                <textarea
                  value={editTeamDesc}
                  onChange={(e) => setEditTeamDesc(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200/80 focus:outline-none focus:border-slate-400 focus:ring-4 focus:ring-slate-100 bg-slate-50/50 hover:bg-slate-50 focus:bg-white transition-all text-sm font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-medium min-h-[90px] resize-none shadow-sm"
                  placeholder={t("teamDescPlaceholder")}
                />
              </div>
              <button
                type="submit"
                disabled={isEditingTeam}
                className="w-full mt-2 py-3 rounded-full bg-primary-500 hover:bg-primary-600 active:scale-[0.98] text-white text-sm font-bold shadow-md shadow-primary-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:pointer-events-none hover:-translate-y-0.5"
              >
                {isEditingTeam ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t("btnSaving") || "Saving..."}</>
                ) : (
                  <><Check className="w-4 h-4 stroke-[3]" /> {t("btnSaveChanges") || "Save Changes"}</>
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Delete Team Modal */}
      {isDeleteTeamOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-md bg-white/95 backdrop-blur-2xl rounded-3xl shadow-2xl border border-rose-200/80 overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-rose-100 bg-rose-50/50">
              <div className="flex items-center gap-3">
                <Trash2 className="w-6 h-6 text-rose-500" />
                <div>
                  <h3 className="text-base font-bold text-rose-900 flex items-center gap-2">
                    Delete Team
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsDeleteTeamOpen(false)}
                disabled={isDeletingTeam}
                type="button"
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors disabled:opacity-50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6">
              <p className="text-sm font-medium text-slate-700 mb-6">
                Are you sure you want to delete <span className="font-bold text-slate-900">"{team.name}"</span>? This action cannot be undone and all tasks and memberships will be lost.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setIsDeleteTeamOpen(false)}
                  disabled={isDeletingTeam}
                  type="button"
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 active:scale-95 transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteTeam}
                  disabled={isDeletingTeam}
                  type="button"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-rose-500 to-red-600 hover:from-rose-600 hover:to-red-700 shadow-md shadow-rose-500/25 active:scale-95 transition-all disabled:opacity-50"
                >
                  {isDeletingTeam ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                  {isDeletingTeam ? "Deleting..." : "Delete Team"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
