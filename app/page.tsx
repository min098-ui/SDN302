"use client";

import { useEffect, useState, useMemo } from "react";
import {
  Plus,
  Search,
  CheckCircle2,
  Clock,
  ListTodo,
  AlertCircle,
  RefreshCw,
  LayoutGrid,
  List,
  Filter,
  ArrowUpDown,
  X,
  Sparkles,
  Zap,
  TrendingUp,
} from "lucide-react";
import TaskCard from "@/components/TaskCard";
import TaskListView from "@/components/TaskListView";
import TaskModal from "@/components/TaskModal";
import Toast, { ToastMessage } from "@/components/Toast";
import DeleteConfirmModal from "@/components/DeleteConfirmModal";
import { useLanguage } from "@/lib/languageContext";
import { Task, TaskFormData, TaskStatus, TaskPriority } from "@/lib/types";

export default function HomePage() {
  const { t } = useLanguage();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Toast Notifications
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const addToast = (type: "success" | "error" | "info", title: string, description?: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts((prev) => [...prev, { id, type, title, description }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Filters & Search
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "dueDate" | "title" | "priority">("newest");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  // Delete Confirm Modal State
  const [deletingTask, setDeletingTask] = useState<Task | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/tasks");
      if (!res.ok) {
        throw new Error(`Failed to load tasks (Status: ${res.status})`);
      }
      const data = await res.json();
      setTasks(data);
    } catch (err: unknown) {
      console.error(err);
      setError(
        err instanceof Error
          ? err.message
          : "Could not connect to the database. Make sure your DATABASE_URL is configured."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const initialLoad = async () => {
      try {
        setError(null);
        const res = await fetch("/api/tasks");
        if (!res.ok) {
          throw new Error(`Failed to load tasks (Status: ${res.status})`);
        }
        const data = await res.json();
        if (isMounted) setTasks(data);
      } catch (err: unknown) {
        if (isMounted) {
          setError(
            err instanceof Error
              ? err.message
              : "Could not connect to the database. Make sure your DATABASE_URL is configured."
          );
        }
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initialLoad();
    return () => {
      isMounted = false;
    };
  }, []);

  // Handle Create or Update
  const handleFormSubmit = async (formData: TaskFormData) => {
    if (editingTask) {
      const res = await fetch(`/api/tasks/${editingTask.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error || "Failed to update task";
        addToast("error", t("toastErrorUpdate"), msg);
        throw new Error(msg);
      }

      const updated = await res.json();
      setTasks((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
      addToast("success", t("toastUpdatedTitle"), `${t("toastUpdatedDesc")} "${updated.title}".`);
    } else {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const msg = errorData.error || "Failed to create task";
        addToast("error", t("toastErrorCreate"), msg);
        throw new Error(msg);
      }

      const created = await res.json();
      setTasks((prev) => [created, ...prev]);

      // If user had an active filter that would hide this newly created task, auto reset filter
      if (statusFilter !== "ALL" && statusFilter !== created.status) {
        setStatusFilter("ALL");
      }
      if (priorityFilter !== "ALL" && priorityFilter !== created.priority) {
        setPriorityFilter("ALL");
      }
      if (searchQuery.trim() !== "") {
        setSearchQuery("");
      }

      addToast("success", t("toastCreatedTitle"), `"${created.title}" ${t("toastCreatedDesc")}`);
    }
  };

  // Open Delete Confirmation Modal
  const handleDeleteTask = (id: string) => {
    const taskToDelete = tasks.find((t) => t.id === id);
    if (taskToDelete) {
      setDeletingTask(taskToDelete);
    }
  };

  // Confirm Delete
  const handleConfirmDelete = async () => {
    if (!deletingTask) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/tasks/${deletingTask.id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete task");
      }

      setTasks((prev) => prev.filter((t) => t.id !== deletingTask.id));
      addToast("success", t("toastDeletedTitle"), `"${deletingTask.title}" ${t("toastDeletedDesc")}`);
      setDeletingTask(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to delete task";
      addToast("error", t("toastErrorDelete"), msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Toggle status
  const handleToggleStatus = async (task: Task) => {
    const nextStatus: Record<TaskStatus, TaskStatus> = {
      TODO: "IN_PROGRESS",
      IN_PROGRESS: "DONE",
      DONE: "TODO",
    };
    const newStatus = nextStatus[task.status];

    setTasks((prev) => prev.map((t) => (t.id === task.id ? { ...t, status: newStatus } : t)));
    addToast("info", t("toastStatusTitle"), `"${task.title}" ➔ ${newStatus}`);

    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        fetchTasks();
        addToast("error", t("toastErrorSync"), "Failed to update status in the database");
      }
    } catch {
      fetchTasks();
      addToast("error", t("toastErrorNetwork"), t("toastErrorNetworkDesc"));
    }
  };

  // Open Edit Modal
  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setIsModalOpen(true);
  };

  // Open Create Modal
  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  // Statistics
  const stats = useMemo(() => {
    const total = tasks.length;
    const todo = tasks.filter((t) => t.status === "TODO").length;
    const inProgress = tasks.filter((t) => t.status === "IN_PROGRESS").length;
    const done = tasks.filter((t) => t.status === "DONE").length;
    const completionRate = total > 0 ? Math.round((done / total) * 100) : 0;

    return { total, todo, inProgress, done, completionRate };
  }, [tasks]);

  // Filtered & Sorted tasks
  const filteredTasks = useMemo(() => {
    return tasks
      .filter((t) => {
        const matchesStatus = statusFilter === "ALL" ? true : t.status === statusFilter;
        const matchesPriority = priorityFilter === "ALL" ? true : t.priority === priorityFilter;
        const matchesSearch =
          t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesStatus && matchesPriority && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === "newest") {
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
        if (sortBy === "oldest") {
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        }
        if (sortBy === "title") {
          return a.title.localeCompare(b.title);
        }
        if (sortBy === "priority") {
          const pOrder: Record<TaskPriority, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
          return pOrder[b.priority] - pOrder[a.priority];
        }
        if (sortBy === "dueDate") {
          if (!a.dueDate) return 1;
          if (!b.dueDate) return -1;
          return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
        }
        return 0;
      });
  }, [tasks, statusFilter, priorityFilter, searchQuery, sortBy]);

  return (
    <div className="w-full max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 md:py-14 space-y-12 animate-in fade-in duration-500">
      <section className="relative overflow-hidden rounded-[3rem] bg-slate-900 border border-slate-800 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] p-10 md:p-14 text-white">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-primary-500/30 via-secondary-500/20 to-transparent blur-[80px] rounded-full translate-x-1/3 -translate-y-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] bg-gradient-to-tr from-primary-500/20 to-emerald-500/10 blur-[60px] rounded-full translate-y-1/4 pointer-events-none" />
        <div className="relative z-10 flex flex-col items-start gap-4 flex-1">
          <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-white/10 text-primary-300 border border-white/20 shadow-sm backdrop-blur-md">
            <Zap className="w-4 h-4" />
            <span className="text-[11px] font-black tracking-widest uppercase">{t("liveWorkspace")}</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-tight flex items-center gap-4">
            {t("heroTitle")}
          </h1>
          <p className="text-slate-300 text-lg md:text-xl font-medium max-w-3xl leading-relaxed mt-2">
            {t("heroDesc")}
          </p>
        </div>
        <div className="absolute top-10 right-10 flex items-center gap-3 z-10">
          <button onClick={fetchTasks} className="p-3.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/10 text-white transition-all shadow-sm active:scale-95"><RefreshCw className={`w-5 h-5 ${loading ? "animate-spin text-primary-400" : ""}`} /></button>
          <button onClick={() => setIsModalOpen(true)} className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-primary-500 to-secondary-500 hover:from-primary-400 hover:to-secondary-400 text-white font-bold shadow-[0_8px_20px_rgba(14,165,233,0.3)] transition-all flex items-center gap-2"><Plus className="w-5 h-5 stroke-[3]" />{t("btnNewTask")}</button>
        </div>
      </section>

      {/* Main Split Layout: Sidebar + Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 items-start">
        
        {/* LEFT SIDEBAR: Insights & KPIs */}
        <aside className="w-full lg:w-[260px] xl:w-[280px] shrink-0 flex flex-col gap-4 lg:sticky lg:top-24">
          
          {/* Sprint Progress Widget */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-bold text-slate-800">Sprint Progress</span>
              <span className="text-xs font-black text-secondary-700 bg-secondary-50 px-2.5 py-0.5 rounded-md border border-secondary-100 shadow-2xs">
                {stats.completionRate}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden mb-3 border border-slate-200/60 p-[1px]">
              <div 
                className="h-full sprint-progress-bar rounded-full transition-all duration-700"
                style={{ width: `${stats.completionRate}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] font-semibold text-slate-500">
              <span className="flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-500" /> {stats.done} Done</span>
              <span className="flex items-center gap-1"><ListTodo className="w-3 h-3 text-primary-500" /> {stats.total} Total</span>
            </div>
          </div>

          {/* Vertical KPI Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {/* Card 1: Total */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/60 bg-white shadow-xs hover:shadow-md hover:border-primary-300 transition-all flex items-center gap-3.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <ListTodo className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 leading-none mb-1">{stats.total}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("statTotal")}</div>
              </div>
            </div>

            {/* Card 2: To Do */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/60 bg-white shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex items-center gap-3.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 leading-none mb-1">{stats.todo}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("statTodo")}</div>
              </div>
            </div>

            {/* Card 3: In Progress */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/60 bg-white shadow-xs hover:shadow-md hover:border-primary-300 transition-all flex items-center gap-3.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 leading-none mb-1">{stats.inProgress}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("statInProgress")}</div>
              </div>
            </div>

            {/* Card 4: Done */}
            <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-200/60 bg-white shadow-xs hover:shadow-md hover:border-emerald-300 transition-all flex items-center gap-3.5 group">
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <div>
                <div className="text-xl sm:text-2xl font-black text-slate-800 leading-none mb-1">{stats.done}</div>
                <div className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider">{t("statDone")}</div>
              </div>
            </div>
          </div>
        </aside>

        {/* MAIN CONTENT: Toolbar & Tasks */}
        <main className="flex-1 w-full min-w-0 flex flex-col gap-4">
          
          {/* Clean Flat Toolbar */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-sm mb-2">
            {/* Top Row: Search & Priority & Sort */}
            <div className="flex flex-col md:flex-row md:items-center gap-4 border-b border-slate-100 pb-4 mb-4">
              {/* Search */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-slate-200 text-sm focus:outline-none focus:border-slate-300 focus:ring-2 focus:ring-slate-100 transition-all placeholder:text-slate-400"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-3 top-3 text-slate-400 hover:text-slate-700">
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Filters & View Mode */}
              <div className="flex flex-wrap items-center gap-3 shrink-0">
                {/* Priority Selector */}
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <span className="hidden sm:inline">Priority:</span>
                  <select
                    value={priorityFilter}
                    onChange={(e) => setPriorityFilter(e.target.value)}
                    className="appearance-none pr-8 py-2.5 pl-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-slate-300 cursor-pointer font-bold text-slate-800"
                    style={{ background: `url('data:image/svg+xml;utf8,<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>') no-repeat right 0.75rem center / 1rem 1rem` }}
                  >
                    <option value="ALL">{t("filterPriorityAll")}</option>
                    <option value="HIGH">{t("priorityHigh")}</option>
                    <option value="MEDIUM">{t("priorityMedium")}</option>
                    <option value="LOW">{t("priorityLow")}</option>
                  </select>
                </div>
                
                {/* Sort Selector */}
                <div className="flex items-center gap-2 text-sm text-slate-600 font-medium">
                  <span className="hidden sm:inline">Sort:</span>
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                    className="appearance-none pr-8 py-2.5 pl-3 rounded-lg border border-slate-200 bg-white focus:outline-none focus:border-slate-300 cursor-pointer font-bold text-slate-800"
                    style={{ background: `url('data:image/svg+xml;utf8,<svg fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" xmlns="http://www.w3.org/2000/svg"><path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"></path></svg>') no-repeat right 0.75rem center / 1rem 1rem` }}
                  >
                    <option value="newest">{t("sortByNewest")}</option>
                    <option value="oldest">{t("sortByOldest")}</option>
                    <option value="dueDate">{t("sortByDueDate")}</option>
                    <option value="priority">{t("sortByPriority")}</option>
                    <option value="title">{t("sortByTitle")}</option>
                  </select>
                </div>
                
                {/* View Mode Toggle (Grid/List) */}
                <div className="flex items-center p-1 rounded-lg border border-slate-200 bg-slate-50 ml-1">
                  <button
                    onClick={() => setViewMode("grid")}
                    className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === "grid" ? "bg-white shadow-xs text-slate-800 font-bold border border-slate-100" : "text-slate-500 hover:text-slate-700"}`}
                    title="Grid View"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setViewMode("list")}
                    className={`p-1.5 rounded-md text-xs transition-colors ${viewMode === "list" ? "bg-white shadow-xs text-slate-800 font-bold border border-slate-100" : "text-slate-500 hover:text-slate-700"}`}
                    title="List View"
                  >
                    <List className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Row: Tabs & Count */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-1.5 flex-wrap">
                {[
                  { id: "ALL", label: t("filterStatusAll"), count: stats.total },
                  { id: "TODO", label: t("statTodo"), count: stats.todo },
                  { id: "IN_PROGRESS", label: t("statInProgress"), count: stats.inProgress },
                  { id: "DONE", label: t("statDone"), count: stats.done },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-bold transition-colors flex items-center gap-1.5 ${
                      statusFilter === tab.id
                        ? "theme-active-tab text-white shadow-md"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    <span>{tab.label}</span>
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      statusFilter === tab.id ? "bg-white/20" : "bg-white text-slate-500"
                    }`}>
                      {tab.count}
                    </span>
                  </button>
                ))}
              </div>
              <div className="text-sm text-slate-500 font-medium">
                Showing {filteredTasks.length} / {stats.total} tasks
              </div>
            </div>
          </div>

          {/* Database Error Banner if any */}
          {error && (
            <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-sm shadow-xs">
              <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
              <div>
                <p className="font-bold flex items-center gap-1.5">
                  Database Notice
                  <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                    Setup Required
                  </span>
                </p>
                <p className="text-xs text-amber-700 mt-1">{error}</p>
                <p className="text-xs text-amber-600 mt-1">
                  Tip: Configure your <code>DATABASE_URL</code> in <code>.env</code> and run <code>npx prisma migrate dev</code>.
                </p>
              </div>
            </div>
          )}

          {/* Tasks Render (Grid or List) */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
              {[1, 2, 3, 4, 5, 6].map((idx) => (
                <div
                  key={idx}
                  className="h-32 rounded-2xl bg-white/70 animate-pulse border border-slate-200/80 shadow-xs"
                />
              ))}
            </div>
          ) : filteredTasks.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-3">
                {filteredTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    onEdit={openEditModal}
                    onDelete={handleDeleteTask}
                    onToggleStatus={handleToggleStatus}
                  />
                ))}
              </div>
            ) : (
              <TaskListView
                tasks={filteredTasks}
                onEdit={openEditModal}
                onDelete={handleDeleteTask}
                onToggleStatus={handleToggleStatus}
              />
            )
          ) : (
            /* Polished Empty State */
            <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-primary-300 bg-white/70 backdrop-blur-md shadow-xs">
              <div className="w-20 h-20 mx-auto mb-4 relative animate-cute-float">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot-bunny-nobg.png"
                  alt="Snow Bunny Mascot"
                  width={80}
                  height={80}
                  className="mascot-bunny-img object-contain drop-shadow-md mascot-bunny-img"
                />
              </div>

              <h3 className="text-base font-bold text-slate-800">
                {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
                  ? t("noTasksFound")
                  : "No Tasks Found"}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
                {searchQuery ? "Try a different search term or clear the filters." : "Create your first task to get started."}
              </p>
              {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL" ? (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setStatusFilter("ALL");
                    setPriorityFilter("ALL");
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-colors border border-slate-200"
                >
                  {t("clearFilters")}
                </button>
              ) : (
                <button
                  onClick={openCreateModal}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl theme-gradient-btn hover:scale-105 active:scale-95 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{t("btnNewTask")}</span>
                </button>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Task Modal (Create & Edit) */}
      <TaskModal
        key={editingTask ? editingTask.id : isModalOpen ? "create-open" : "create-closed"}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialTask={editingTask}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={!!deletingTask}
        task={deletingTask}
        isDeleting={isDeleting}
        onClose={() => setDeletingTask(null)}
        onConfirm={handleConfirmDelete}
      />

      {/* Floating Animated Toast Notifications */}
      <Toast toasts={toasts} onDismiss={removeToast} />
    </div>
  );
}

