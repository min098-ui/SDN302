"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Language = "en" | "vi";

interface LanguageContextType {
  language: Language;
  toggleLanguage: () => void;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  en: {
    // Navbar
    navTasks: "Tasks",
    navTeams: "Teams & Workspace",
    navSoon: "SOON",
    navSignIn: "Sign In",
    liveWorkspace: "Live Workspace",
    oceanTheme: "Ocean Theme",
    sunsetTheme: "Sunset Theme",
    switchLanguage: "Tiếng Việt",

    // Hero & Stats
    badgeSubtitle: "Smart & Joyful Workspace",
    heroTitle: "Task Management",
    heroDesc:
      "A modern task management board connected to Supabase PostgreSQL with real-time status tracking, fast filters, and delightful pastel themes.",
    statTotal: "Total Tasks",
    statTodo: "To Do",
    statInProgress: "In Progress",
    statDone: "Done",
    statCompletion: "Completion Rate",

    // Filter bar
    searchPlaceholder: "Search tasks by title or keyword...",
    filterStatusAll: "All",
    filterPriorityAll: "All Priorities",
    priorityHigh: "High Priority",
    priorityMedium: "Medium Priority",
    priorityLow: "Low Priority",
    sortByNewest: "Newest First",
    sortByOldest: "Oldest First",
    sortByDueDate: "Due Date",
    sortByTitle: "Title A-Z",
    sortByPriority: "Priority",
    btnNewTask: "New Task",
    clearFilters: "Clear all filters",
    noTasksFound: "No tasks found",
    noTasksDesc: "Try adjusting your search or filter criteria, or create a brand new task to get started.",
    createFirstTask: "Create First Task",

    // Modal
    modalCreateTitle: "Create New Task",
    modalEditTitle: "Edit Task",
    modalCreateSub: "Specify task title, priority, and completion timeline",
    modalEditSub: "Update task parameters, priority, or deadline",
    labelTitle: "Task Title",
    placeholderTitle: "e.g. Design landing page hero banner...",
    labelDescription: "Description (Optional)",
    placeholderDesc: "Provide more context, action steps, or acceptance criteria...",
    labelPriority: "Priority Level",
    labelStatus: "Status",
    labelDueDate: "Due Date (Optional)",
    btnCancel: "Cancel",
    btnSaving: "Saving...",
    btnCreating: "Creating...",
    btnSaveChanges: "Save Changes",
    btnCreateTask: "Create Task",

    // Delete Modal
    deleteTitle: "Confirm Delete Task",
    deleteWarning: "This action cannot be undone",
    deleteDesc: "Are you sure you want to permanently delete this task from the database?",
    deleteTaskLabel: "Task Title:",
    btnDeleteNow: "Delete Task",
    btnDeleting: "Deleting...",

    // Toasts
    toastCreatedTitle: "Task Created!",
    toastCreatedDesc: "has been added to the task board.",
    toastUpdatedTitle: "Task Updated!",
    toastUpdatedDesc: "Changes saved for",
    toastDeletedTitle: "Task Deleted!",
    toastDeletedDesc: "was removed successfully.",
    toastStatusTitle: "Status Changed",
    toastErrorCreate: "Creation Error",
    toastErrorUpdate: "Update Error",
    toastErrorDelete: "Delete Error",
    toastErrorSync: "Sync Error",
    toastErrorNetwork: "Network Error",
    toastErrorNetworkDesc: "Please check your network connection.",

    // Footer
    footerSubtitle: "Smart, Joyful & Effortless Productivity",
    footerCopy: "Task & Team Management App. Built for Assignment 1.",

    // Teams Dashboard
    cmdCenter: "Command Center",
    welcomeBack: "Welcome back",
    teamsHeroDesc: "Manage your workspaces, track team productivity, and collaborate seamlessly in one unified hub.",
    myWorkspaces: "My Workspaces",
    createNewTeam: "Create New Team",
    noWorkspacesFound: "No workspaces found",
    noWorkspacesDesc: "Try a different search term or create a new team.",
    createFirstTeam: "Create First Team",
    ownerLabel: "Owner",
    memberLabel: "Member",
    noDescProvided: "No description provided",
    createWorkspace: "Create Workspace",
    teamName: "Team Name",
    teamNamePlaceholder: "e.g. Engineering Team",
    descOptional: "Description (Optional)",
    teamDescPlaceholder: "What is this team's primary goal?",
    btnCreateTeam: "Create Team",
    signInRequired: "Sign in required",
    signInDesc: "You need to be logged in to view your teams, invite members, and collaborate on shared tasks.",
    btnSignInNow: "Sign In Now",
    btnCreateAccount: "Create Account",

    // Team Detail
    backToWorkspaces: "Back to Workspaces",
    teamMembers: "Team Members",
    teamTasks: "Team Tasks",
    teamTasksDesc: "Manage and track progress for all team assignments.",
    addMember: "Add Member",
    addMemberDesc: "Invite a new member to collaborate.",
    userEmail: "User Email",
    emailPlaceholder: "e.g. member@example.com",
    btnAdd: "Add",
    btnAdding: "Adding...",
    noMembers: "No members yet",
    viewAsGrid: "Grid View",
    viewAsList: "List View",
    searchTasks: "Search tasks...",

    // Assignment 3 & 4: Real-time & Collaboration
    tabBoard: "Kanban Board",
    tabChat: "Team Chat",
    tabMembers: "Members & Roles",
    tabActivity: "Activity Audit",
    notifications: "Notifications",
    markAllRead: "Mark all read",
    noNotifications: "No notifications yet",
    realtimeConnected: "Live Sync Active",
    roleOwner: "Owner",
    roleAdmin: "Admin",
    roleMember: "Member",
    chatPlaceholder: "Type a message...",
    send: "Send",
    online: "online",
    typing: "is typing...",
    severalTyping: "are typing...",
    auditTrail: "Team Activity Audit Trail",

    // Team Chat & Realtime
    chatRoom: "Team Chat",
    chatConnected: "Live Sync Active",
    connecting: "Connecting...",
    noMessagesYet: "No messages in team chat yet",
    startChatHint: "Say hello to your teammates and start collaborating in real-time!",
    attachFileTooltip: "Attach image or file",

    // RBAC & Members
    rbacMatrix: "Role-Based Access Control (RBAC) Matrix",
    rbacOwnerDesc: "Full control: manage all members & roles, edit/delete any task, update team settings, or delete the team.",
    rbacAdminDesc: "Can invite members, manage member roles, and edit/delete all team tasks. Cannot delete the team.",
    rbacMemberDesc: "Can create tasks, update their assigned tasks & status, participate in team chat. Cannot delete other members' tasks.",
    teamRoster: "Team Roster",
    yourCurrentRole: "Your current role:",
    inviteTeammate: "Invite Teammate",
    inviteTeammateDesc: "Only Owners and Admins have permission to invite new members.",
    emailAddress: "Email Address",
    initialRole: "Initial Role",
    btnSendInvite: "Send Invite",
    btnInviting: "Inviting...",
    leaveTeam: "Leave Team",
    removeMember: "Remove Member",

    // Activity Log
    auditLogSubtitle: "Real-time audit log of all changes, assignments, and member management.",
    filterAll: "All Activity",
    filterTasks: "Tasks",
    filterMembers: "Members",
    noActivityYet: "No activity recorded yet",
    activityHint: "Actions performed by team members will appear live here.",
  },
  vi: {
    // Navbar
    navTasks: "Nhiệm vụ",
    navTeams: "Nhóm & Không gian làm việc",
    navSoon: "SẮP RA",
    navSignIn: "Đăng nhập",
    liveWorkspace: "Không gian làm việc",
    oceanTheme: "Chủ đề Biển",
    sunsetTheme: "Chủ đề Hoàng Hôn",
    switchLanguage: "English",

    // Hero & Stats
    badgeSubtitle: "Không gian làm việc thông minh & tinh tế",
    heroTitle: "Quản lý Nhiệm vụ",
    heroDesc:
      "Bảng quản lý công việc hiện đại kết nối Supabase PostgreSQL với khả năng theo dõi trạng thái tức thì, bộ lọc tiện lợi cùng giao diện pastel êm dịu.",
    statTotal: "Tổng nhiệm vụ",
    statTodo: "Cần làm",
    statInProgress: "Đang làm",
    statDone: "Hoàn thành",
    statCompletion: "Tỉ lệ hoàn thành",

    // Filter bar
    searchPlaceholder: "Tìm kiếm nhiệm vụ theo tiêu đề hoặc từ khóa...",
    filterStatusAll: "Tất cả",
    filterPriorityAll: "Mọi mức ưu tiên",
    priorityHigh: "Ưu tiên Cao",
    priorityMedium: "Ưu tiên Trung bình",
    priorityLow: "Ưu tiên Thấp",
    sortByNewest: "Mới nhất trước",
    sortByOldest: "Cũ nhất trước",
    sortByDueDate: "Hạn chót",
    sortByTitle: "Tiêu đề A-Z",
    sortByPriority: "Mức ưu tiên",
    btnNewTask: "Nhiệm vụ mới",
    clearFilters: "Xóa tất cả bộ lọc",
    noTasksFound: "Không tìm thấy nhiệm vụ nào",
    noTasksDesc: "Hãy thử thay đổi từ khóa tìm kiếm, điều chỉnh bộ lọc hoặc tạo một nhiệm vụ mới.",
    createFirstTask: "Tạo nhiệm vụ đầu tiên",

    // Modal
    modalCreateTitle: "Tạo nhiệm vụ mới",
    modalEditTitle: "Chỉnh sửa nhiệm vụ",
    modalCreateSub: "Nhập tiêu đề, chọn mức ưu tiên và thời hạn hoàn thành",
    modalEditSub: "Cập nhật các thông số, mức ưu tiên hoặc thời hạn nhiệm vụ",
    labelTitle: "Tiêu đề nhiệm vụ",
    placeholderTitle: "Ví dụ: Thiết kế banner trang chủ...",
    labelDescription: "Mô tả chi tiết (Tùy chọn)",
    placeholderDesc: "Mô tả cụ thể nội dung công việc, tiêu chí hoàn thành...",
    labelPriority: "Mức độ ưu tiên",
    labelStatus: "Trạng thái",
    labelDueDate: "Hạn hoàn thành (Tùy chọn)",
    btnCancel: "Hủy bỏ",
    btnSaving: "Đang lưu...",
    btnCreating: "Đang tạo...",
    btnSaveChanges: "Lưu thay đổi",
    btnCreateTask: "Tạo nhiệm vụ",

    // Delete Modal
    deleteTitle: "Xác nhận xóa nhiệm vụ",
    deleteWarning: "Hành động này không thể hoàn tác",
    deleteDesc: "Bạn có chắc chắn muốn xóa vĩnh viễn nhiệm vụ này khỏi cơ sở dữ liệu Supabase không?",
    deleteTaskLabel: "Nhiệm vụ:",
    btnDeleteNow: "Xóa nhiệm vụ",
    btnDeleting: "Đang xóa...",

    // Toasts
    toastCreatedTitle: "Tạo nhiệm vụ thành công!",
    toastCreatedDesc: "đã được thêm vào danh sách.",
    toastUpdatedTitle: "Cập nhật thành công!",
    toastUpdatedDesc: "Đã lưu thay đổi cho",
    toastDeletedTitle: "Đã xóa nhiệm vụ!",
    toastDeletedDesc: "đã được xóa khỏi hệ thống.",
    toastStatusTitle: "Đã chuyển trạng thái",
    toastErrorCreate: "Lỗi tạo mới",
    toastErrorUpdate: "Lỗi cập nhật",
    toastErrorDelete: "Lỗi xóa nhiệm vụ",
    toastErrorSync: "Lỗi đồng bộ",
    toastErrorNetwork: "Lỗi mạng",
    toastErrorNetworkDesc: "Vui lòng kiểm tra lại kết nối mạng.",

    // Footer
    footerSubtitle: "Hiệu suất thông minh, nhẹ nhàng & trực quan",
    footerCopy: "Ứng dụng Quản lý Nhiệm vụ & Nhóm. Xây dựng cho Assignment 1.",

    // Teams Dashboard
    cmdCenter: "Trung tâm Điều khiển",
    welcomeBack: "Chào mừng trở lại",
    teamsHeroDesc: "Quản lý không gian làm việc, theo dõi tiến độ nhóm và cộng tác mượt mà trong một trung tâm duy nhất.",
    myWorkspaces: "Không gian làm việc",
    createNewTeam: "Tạo Nhóm Mới",
    noWorkspacesFound: "Không tìm thấy không gian làm việc nào",
    noWorkspacesDesc: "Hãy thử thay đổi từ khóa tìm kiếm hoặc tạo nhóm mới.",
    createFirstTeam: "Tạo Nhóm Đầu Tiên",
    ownerLabel: "Chủ nhóm",
    memberLabel: "Thành viên",
    noDescProvided: "Không có mô tả",
    createWorkspace: "Tạo Không Gian Làm Việc",
    teamName: "Tên nhóm",
    teamNamePlaceholder: "Ví dụ: Nhóm Kỹ Thuật",
    descOptional: "Mô tả (Tùy chọn)",
    teamDescPlaceholder: "Mục tiêu chính của nhóm là gì?",
    btnCreateTeam: "Tạo Nhóm",
    signInRequired: "Yêu cầu đăng nhập",
    signInDesc: "Bạn cần đăng nhập để xem danh sách nhóm, mời thành viên và cộng tác trên các nhiệm vụ chung.",
    btnSignInNow: "Đăng nhập ngay",
    btnCreateAccount: "Tạo tài khoản",

    // Team Detail
    backToWorkspaces: "Quay lại Không gian làm việc",
    teamMembers: "Thành viên nhóm",
    teamTasks: "Nhiệm vụ của nhóm",
    teamTasksDesc: "Quản lý và theo dõi tiến độ công việc chung của toàn nhóm.",
    addMember: "Thêm thành viên",
    addMemberDesc: "Mời thành viên mới tham gia không gian làm việc.",
    userEmail: "Email người dùng",
    emailPlaceholder: "Ví dụ: member@example.com",
    btnAdd: "Thêm",
    btnAdding: "Đang thêm...",
    noMembers: "Chưa có thành viên nào",
    viewAsGrid: "Dạng Lưới",
    viewAsList: "Dạng Danh sách",
    searchTasks: "Tìm kiếm nhiệm vụ...",

    // Assignment 3 & 4: Real-time & Collaboration
    tabBoard: "Bảng Kanban",
    tabChat: "Chat Nhóm Trực Tiếp",
    tabMembers: "Thành viên & Phân quyền",
    tabActivity: "Nhật ký Hoạt động",
    notifications: "Thông báo",
    markAllRead: "Đánh dấu tất cả đã đọc",
    noNotifications: "Chưa có thông báo nào",
    realtimeConnected: "Đồng bộ Trực tiếp",
    roleOwner: "Chủ nhóm (Owner)",
    roleAdmin: "Quản trị viên (Admin)",
    roleMember: "Thành viên (Member)",
    chatPlaceholder: "Nhập tin nhắn trao đổi...",
    send: "Gửi",
    online: "đang trực tuyến",
    typing: "đang nhập...",
    severalTyping: "đang nhập tin nhắn...",
    auditTrail: "Nhật ký Hoạt động Nhóm",

    // Team Chat & Realtime
    chatRoom: "Trò chuyện nhóm",
    chatConnected: "Đồng bộ Trực tiếp",
    connecting: "Đang kết nối...",
    noMessagesYet: "Chưa có tin nhắn nào trong phòng chat",
    startChatHint: "Hãy gửi lời chào đến các thành viên trong nhóm và bắt đầu trao đổi!",
    attachFileTooltip: "Đính kèm ảnh hoặc tệp",

    // RBAC & Members
    rbacMatrix: "Ma trận Phân quyền Vai trò (RBAC)",
    rbacOwnerDesc: "Toàn quyền: quản lý thành viên & vai trò, sửa/xóa mọi nhiệm vụ, chỉnh sửa hoặc xóa nhóm.",
    rbacAdminDesc: "Có thể mời thành viên, phân quyền thành viên và sửa/xóa nhiệm vụ của nhóm. Không thể xóa nhóm.",
    rbacMemberDesc: "Có thể tạo nhiệm vụ, cập nhật trạng thái nhiệm vụ được giao, tham gia chat nhóm. Không thể xóa nhiệm vụ của người khác.",
    teamRoster: "Danh sách Thành viên",
    yourCurrentRole: "Vai trò hiện tại của bạn:",
    inviteTeammate: "Mời Thành viên Mới",
    inviteTeammateDesc: "Chỉ Chủ nhóm và Quản trị viên mới có quyền mời thành viên mới.",
    emailAddress: "Địa chỉ Email",
    initialRole: "Vai trò Ban đầu",
    btnSendInvite: "Gửi Lời mời",
    btnInviting: "Đang gửi...",
    leaveTeam: "Rời nhóm",
    removeMember: "Xóa thành viên",

    // Activity Log
    auditLogSubtitle: "Nhật ký thời gian thực ghi lại toàn bộ thay đổi, phân công và quản lý thành viên.",
    filterAll: "Tất cả hoạt động",
    filterTasks: "Nhiệm vụ",
    filterMembers: "Thành viên",
    noActivityYet: "Chưa có hoạt động nào được ghi lại",
    activityHint: "Các hành động của thành viên trong nhóm sẽ xuất hiện trực tiếp tại đây.",
  },
};

const LanguageContext = createContext<LanguageContextType>({
  language: "en",
  toggleLanguage: () => {},
  setLanguage: () => {},
  t: (key: string) => key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>("vi");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    const saved = localStorage.getItem("app-language") as Language | null;
    if (saved === "vi" || saved === "en") {
      setLanguageState(saved);
    } else {
      setLanguageState("vi");
      localStorage.setItem("app-language", "vi");
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem("app-language", lang);
  };

  const toggleLanguage = () => {
    const next = language === "en" ? "vi" : "en";
    setLanguage(next);
  };

  const t = (key: string): string => {
    if (!mounted) {
      return translations.vi[key] || translations.en[key] || key;
    }
    return translations[language]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, toggleLanguage, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}
