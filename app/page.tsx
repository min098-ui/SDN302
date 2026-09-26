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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-10 space-y-8">
      {/* 
        Eye-Catching Luminous Showcase Banner
        Multi-color: Sky Blue + Royal Violet + Rose Pink
        Not dark, not glaring white: silky frosted glass with vibrant aurora lights!
      */}
      <section className="relative overflow-hidden rounded-3xl p-8 sm:p-10 bg-white/75 backdrop-blur-2xl border border-white/90 shadow-xl shadow-sky-950/5">
        {/* Colorful Aurora Ambient Spots */}
        <div className="absolute -top-16 -left-16 w-72 h-72 theme-halo-1 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 theme-halo-2 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 theme-halo-3 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          <div className="space-y-4 max-w-2xl">
            {/* Colorful Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full theme-accent-badge border text-xs font-bold uppercase tracking-wider backdrop-blur-sm shadow-2xs">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{t("badgeSubtitle")}</span>
            </div>

            {/* Glowing Gradient Title */}
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-tight">
              {t("heroTitle")}
            </h1>

            <p className="text-sm sm:text-base text-slate-600 leading-relaxed font-normal">
              {t("heroDesc")}
            </p>

            {/* Action Buttons */}
            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                onClick={openCreateModal}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl theme-gradient-btn hover:scale-105 active:scale-95 text-white text-xs sm:text-sm font-bold shadow-lg transition-all"
              >
                <Plus className="w-4 h-4 stroke-[3]" />
                <span>{t("btnNewTask")}</span>
              </button>
              <button
                onClick={fetchTasks}
                className="inline-flex items-center gap-2 px-4 py-3 rounded-2xl border border-slate-200/80 bg-white/90 hover:bg-slate-50 text-slate-700 text-xs sm:text-sm font-semibold backdrop-blur-sm transition-all shadow-xs hover:border-slate-300"
                title="Refresh Board"
              >
                <RefreshCw className={`w-4 h-4 text-sky-600 ${loading ? "animate-spin" : ""}`} />
                <span>{t("filterStatusAll") === "All" ? "Refresh Board" : "Làm mới bảng"}</span>
              </button>
            </div>
          </div>

          {/* Right Mascot & Interactive Sprint Progress Showcase */}
          <div className="flex flex-col sm:flex-row lg:flex-col gap-4 items-center justify-center">
            {/* Mascot Avatar Card with Glowing Halo */}
            <div className="relative group p-4 rounded-3xl bg-white/90 border theme-mascot-card backdrop-blur-xl shadow-lg flex items-center gap-4 min-w-[270px]">
              <div className="w-16 h-16 relative flex items-center justify-center shrink-0">
                <div className="absolute inset-0 rounded-full blur-md group-hover:scale-110 transition-transform theme-halo-1" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/mascot-fox.png"
                  alt="Snow Fox Mascot"
                  width={62}
                  height={62}
                  className="object-contain relative z-10 animate-cute-float mascot-fox-img"
                />
              </div>
              <div>
                <div className="text-xs font-bold theme-gradient-text flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                  <span>Kitsune Workspace</span>
                </div>
                <div className="text-sm font-extrabold text-slate-900 mt-0.5">
                  {stats.done === stats.total && stats.total > 0
                    ? "All Goals Smashed! 🎉"
                    : `${stats.inProgress + stats.todo} Tasks Active`}
                </div>
                <div className="text-[11px] text-slate-500">Ready for your next milestone</div>
              </div>
            </div>

            {/* Sprint Progress Card */}
            <div className="p-4 rounded-3xl bg-white/90 border border-purple-200/70 backdrop-blur-xl shadow-lg shadow-purple-500/10 min-w-[270px]">
              <div className="flex items-center justify-between text-xs font-bold mb-2">
                <span className="text-purple-700 flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-purple-600" />
                  Sprint Completion
                </span>
                <span className="text-purple-700 bg-purple-50 border border-purple-200 px-2 py-0.5 rounded-full text-[11px] font-extrabold">
                  {stats.completionRate}%
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
                <div
                  className="h-full sprint-progress-bar rounded-full transition-all duration-700 shadow-xs"
                  style={{ width: `${stats.completionRate}%` }}
                />
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2 font-medium">
                <span>Completed: <strong className="text-emerald-700">{stats.done}</strong></span>
                <span>Remaining: <strong className="text-slate-700">{stats.todo + stats.inProgress}</strong></span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4 Eye-Catching KPI Cards with 3 Rich Colors + Emerald */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Tasks - Royal Purple & Indigo */}
        <div className="relative overflow-hidden rounded-2xl p-5 border border-indigo-200/80 bg-gradient-to-br from-indigo-50/90 via-purple-50/50 to-white/95 shadow-md shadow-indigo-500/5 hover:border-indigo-400 hover:-translate-y-1 transition-all group backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-indigo-700 uppercase tracking-wider">
              {t("statTotal")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-500/15 text-indigo-700 border border-indigo-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ListTodo className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.total}</div>
          <div className="text-[11px] text-indigo-600/90 font-medium mt-1">All workspace deliverables</div>
        </div>

        {/* Card 2: To Do - Warm Amber & Sunset Rose */}
        <div className="relative overflow-hidden rounded-2xl p-5 border border-amber-200/80 bg-gradient-to-br from-amber-50/90 via-orange-50/50 to-white/95 shadow-md shadow-amber-500/5 hover:border-amber-400 hover:-translate-y-1 transition-all group backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
              {t("statTodo")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-800 border border-amber-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.todo}</div>
          <div className="text-[11px] text-amber-700/90 font-medium mt-1">Pending queue items</div>
        </div>

        {/* Card 3: In Progress - Electric Cyan & Sky Blue */}
        <div className="relative overflow-hidden rounded-2xl p-5 border border-sky-200/80 bg-gradient-to-br from-sky-50/90 via-cyan-50/50 to-white/95 shadow-md shadow-sky-500/5 hover:border-sky-400 hover:-translate-y-1 transition-all group backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-sky-700 uppercase tracking-wider">
              {t("statInProgress")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-500/15 text-sky-700 border border-sky-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Clock className="w-4 h-4 text-sky-600 animate-spin" style={{ animationDuration: "8s" }} />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.inProgress}</div>
          <div className="text-[11px] text-sky-600/90 font-medium mt-1">Active sprint focus</div>
        </div>

        {/* Card 4: Done - Fresh Emerald & Teal */}
        <div className="relative overflow-hidden rounded-2xl p-5 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/90 via-teal-50/50 to-white/95 shadow-md shadow-emerald-500/5 hover:border-emerald-400 hover:-translate-y-1 transition-all group backdrop-blur-md">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">
              {t("statDone")}
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-500/15 text-emerald-700 border border-emerald-200 flex items-center justify-center group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-3xl font-black text-slate-900 tracking-tight">{stats.done}</div>
          <div className="text-[11px] text-emerald-600/90 font-medium mt-1">Successfully delivered</div>
        </div>
      </section>

      {/* Control Toolbar: Multi-Color Tabs, Instant Search & View Mode */}
      <section className="space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white/80 backdrop-blur-xl p-3.5 rounded-2xl border border-white/90 shadow-md">
          {/* Status Tabs with Multi-Color Pill Highlight */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 lg:pb-0">
            {[
              { id: "ALL", label: t("filterStatusAll"), count: stats.total },
              { id: "TODO", label: t("statTodo"), count: stats.todo },
              { id: "IN_PROGRESS", label: t("statInProgress"), count: stats.inProgress },
              { id: "DONE", label: t("statDone"), count: stats.done },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setStatusFilter(tab.id)}
                className={`inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                  statusFilter === tab.id
                    ? "theme-active-tab font-bold"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-100/80"
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                    statusFilter === tab.id
                      ? "bg-white/20 text-white"
                      : "bg-slate-100 text-slate-600 border border-slate-200"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>

          {/* Search, Filter By Priority, Sort & View Mode */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 min-w-[200px]">
              <input
                type="text"
                placeholder={t("searchPlaceholder")}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-8 pr-7 py-2 rounded-xl border border-slate-200 bg-white/90 text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:ring-2 focus:ring-slate-300 focus:border-slate-400 transition-all shadow-2xs"
              />
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-3 pointer-events-none" style={{ color: "var(--accent-color)" }} />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Priority Selector */}
            <div className="relative flex items-center">
              <select
                value={priorityFilter}
                onChange={(e) => setPriorityFilter(e.target.value)}
                className="appearance-none pl-7 pr-7 py-2 rounded-xl border border-slate-200 bg-white/90 text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer shadow-2xs"
              >
                <option value="ALL">{t("filterPriorityAll")}</option>
                <option value="HIGH">{t("priorityHigh")}</option>
                <option value="MEDIUM">{t("priorityMedium")}</option>
                <option value="LOW">{t("priorityLow")}</option>
              </select>
              <Filter className="w-3.5 h-3.5 absolute left-2.5 pointer-events-none" style={{ color: "var(--accent-color)" }} />
            </div>

            {/* Sort Selector */}
            <div className="relative flex items-center">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
                className="appearance-none pl-7 pr-7 py-2 rounded-xl border border-slate-200 bg-white/90 text-slate-700 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-slate-300 cursor-pointer shadow-2xs"
              >
                <option value="newest">{t("sortByNewest")}</option>
                <option value="oldest">{t("sortByOldest")}</option>
                <option value="dueDate">{t("sortByDueDate")}</option>
                <option value="priority">{t("sortByPriority")}</option>
                <option value="title">{t("sortByTitle")}</option>
              </select>
              <ArrowUpDown className="w-3.5 h-3.5 absolute left-2.5 pointer-events-none" style={{ color: "var(--accent-color)" }} />
            </div>

            {/* View Mode Toggle */}
            <div className="flex items-center p-1 rounded-xl bg-slate-100/90 border border-slate-200/80">
              <button
                onClick={() => setViewMode("grid")}
                title="Grid Cards View"
                style={{ color: viewMode === "grid" ? "var(--accent-color)" : undefined }}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setViewMode("list")}
                title="Table List View"
                style={{ color: viewMode === "list" ? "var(--accent-color)" : undefined }}
                className={`p-1.5 rounded-lg text-xs transition-colors ${
                  viewMode === "list"
                    ? "bg-white shadow-xs font-bold"
                    : "text-slate-500 hover:text-slate-900"
                }`}
              >
                <List className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Database Error Banner if any */}
        {error && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 text-amber-800 text-sm shadow-xs">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-600 mt-0.5" />
            <div>
              <p className="font-bold flex items-center gap-1.5">
                Database Notice
                <span className="text-[10px] bg-amber-100 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                  Setup Required
                </span>
              </p>
              <p className="text-xs text-amber-700 mt-1">{error}</p>
              <p className="text-xs text-amber-600 mt-2">
                Tip: Configure your <code>DATABASE_URL</code> in <code>.env</code> and run{" "}
                <code>npx prisma migrate dev --name init</code>.
              </p>
            </div>
          </div>
        )}

        {/* Tasks Render (Grid or List) */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((idx) => (
              <div
                key={idx}
                className="h-44 rounded-2xl bg-white/70 animate-pulse border border-slate-200/80 shadow-xs"
              />
            ))}
          </div>
        ) : filteredTasks.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
          /* Polished Empty State with Snow Fox Mascot */
          <div className="text-center py-16 px-4 rounded-3xl border border-dashed border-sky-300 bg-white/70 backdrop-blur-md shadow-xs">
            <div className="w-24 h-24 mx-auto mb-4 relative animate-cute-float">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/mascot-fox.png"
                alt="Snow Fox Mascot"
                width={96}
                height={96}
                className="object-contain drop-shadow-md mascot-fox-img"
              />
            </div>

            <h3 className="text-lg font-bold text-slate-800">
              {searchQuery || statusFilter !== "ALL" || priorityFilter !== "ALL"
                ? t("noTasksFound")
                : t("noTasksFound")}
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-5">
              {t("noTasksDesc")}
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
                <span>{t("createFirstTask")}</span>
              </button>
            )}
          </div>
        )}
      </section>

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
