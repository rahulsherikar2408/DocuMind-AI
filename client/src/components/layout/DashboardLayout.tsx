import { useEffect, useRef, useState, type ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import { useClerk } from "@clerk/react";
import {
  Menu,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Settings,
  LogOut,
  CheckCheck,
  Crown,
  AlertTriangle,
} from "lucide-react";

import Sidebar from "./Sidebar";
import ThemeToggle from "../common/ThemeToggle";
import { useCurrentUser } from "../../hooks/useUser";
import {
  useMarkAllNotificationsAsRead,
  useMarkNotificationAsRead,
  useNotifications,
} from "../../hooks/useNotifications";
import { useToast } from "../../hooks/useToast";
import { AUTH_STATE_KEY, PENDING_TOAST_KEY } from "../../contexts/toastTypes";

interface DashboardLayoutProps {
  children: ReactNode;
}

const getPageTitle = (pathname: string) => {
  if (pathname.startsWith("/documents/")) return "Document Details";
  if (pathname.startsWith("/documents")) return "My Documents";
  if (pathname.startsWith("/chat-history")) return "Chat History";
  if (pathname.startsWith("/chat")) return "AI Chat";
  if (pathname.startsWith("/settings")) return "Settings";
  return "Dashboard";
};

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const location = useLocation();
  const pageTitle = getPageTitle(location.pathname);

  const menuRef = useRef<HTMLDivElement>(null);
  const notificationsRef = useRef<HTMLDivElement>(null);

  const { signOut } = useClerk();
  const toast = useToast();
  const { data: user, isLoading, error } = useCurrentUser();
  const { data: notificationsData } = useNotifications();
  const markReadMutation = useMarkNotificationAsRead();
  const markAllReadMutation = useMarkAllNotificationsAsRead();

  const notifications = notificationsData?.notifications || [];
  const unreadCount = notificationsData?.unreadCount || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setMenuOpen(false);
      }
      if (
        notificationsRef.current &&
        !notificationsRef.current.contains(target)
      ) {
        setNotificationsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setMenuOpen(false);
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="min-h-screen lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur transition-colors duration-200 dark:border-slate-800 dark:bg-slate-900/90 sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div className="hidden items-center gap-2 text-sm text-slate-400 dark:text-slate-500 sm:flex">
              <span>Workspace</span>
              <span>/</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {pageTitle}
              </span>
            </div>

            <h1 className="text-base font-bold text-slate-800 dark:text-slate-100 sm:hidden">
              {pageTitle}
            </h1>
          </div>

          {/* Right section: Theme Toggle, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <div ref={notificationsRef} className="relative">
              <button
                type="button"
                onClick={() => {
                  setNotificationsOpen((prev) => !prev);
                  setMenuOpen(false);
                }}
                aria-expanded={notificationsOpen}
                aria-label="Notifications"
                className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </button>

              {notificationsOpen && (
                <div className="fixed left-4 right-4 top-20 z-50 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl dark:border-slate-800 dark:bg-slate-900 sm:absolute sm:left-auto sm:right-0 sm:top-auto sm:mt-2 sm:w-96">
                  <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3 dark:border-slate-800">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                        Notifications
                      </h3>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400">
                        {unreadCount > 0
                          ? `${unreadCount} unread notification${unreadCount === 1 ? "" : "s"}`
                          : "You're all caught up"}
                      </p>
                    </div>

                    {unreadCount > 0 && (
                      <button
                        type="button"
                        disabled={markAllReadMutation.isPending}
                        onClick={() =>
                          markAllReadMutation.mutate(undefined, {
                            onSuccess: () =>
                              toast.success("All notifications marked as read."),
                            onError: () =>
                              toast.error("Unable to mark notifications as read."),
                          })
                        }
                        className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-xs font-medium text-indigo-600 transition hover:bg-indigo-50 disabled:opacity-50 dark:text-indigo-400 dark:hover:bg-indigo-950/40 cursor-pointer"
                      >
                        <CheckCheck size={14} />
                        Mark all read
                      </button>
                    )}
                  </div>

                  <div className="max-h-80 divide-y divide-slate-100 overflow-y-auto dark:divide-slate-800">
                    {notifications.length === 0 ? (
                      <div className="px-4 py-8 text-center">
                        <Bell
                          size={28}
                          className="mx-auto text-slate-300 dark:text-slate-600"
                        />
                        <p className="mt-2 text-xs font-medium text-slate-500 dark:text-slate-400">
                          No notifications yet
                        </p>
                      </div>
                    ) : (
                      notifications.map((item) => {
                        const isExpiring =
                          item.type === "plan_expiring_tomorrow";

                        return (
                          <div
                            key={item._id}
                            onClick={() => {
                              if (!item.isRead) {
                                markReadMutation.mutate(item._id);
                              }
                            }}
                            className={`flex gap-3 px-4 py-3.5 transition cursor-pointer ${
                              item.isRead
                                ? "bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/40"
                                : "bg-indigo-50/40 hover:bg-indigo-50/70 dark:bg-indigo-950/20 dark:hover:bg-indigo-950/35"
                            }`}
                          >
                            <div
                              className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                                isExpiring
                                  ? "bg-amber-100 text-amber-600 dark:bg-amber-950/70 dark:text-amber-400"
                                  : "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400"
                              }`}
                            >
                              {isExpiring ? (
                                <AlertTriangle size={16} />
                              ) : (
                                <Crown size={16} />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <div className="flex items-start justify-between gap-2">
                                <p className="text-xs font-semibold text-slate-900 dark:text-white">
                                  {item.title}
                                </p>
                                {!item.isRead && (
                                  <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-indigo-600 dark:bg-indigo-400" />
                                )}
                              </div>

                              <p className="mt-0.5 text-xs leading-5 text-slate-600 dark:text-slate-300">
                                {item.message}
                              </p>

                              <div className="mt-1.5 flex items-center justify-between gap-2">
                                <span className="text-[10px] text-slate-400 dark:text-slate-500">
                                  {new Date(item.createdAt).toLocaleString([], {
                                    dateStyle: "medium",
                                    timeStyle: "short",
                                  })}
                                </span>

                                {isExpiring && (
                                  <Link
                                    to="/settings#subscription"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!item.isRead) {
                                        markReadMutation.mutate(item._id);
                                      }
                                      setNotificationsOpen(false);
                                    }}
                                    className="text-[11px] font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
                                  >
                                    Renew Plan
                                  </Link>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            <div
              ref={menuRef}
              className="relative border-l border-slate-200 pl-3 sm:pl-4 dark:border-slate-800"
            >
              <button
                type="button"
                onClick={() => {
                  setMenuOpen((prev) => !prev);
                  setNotificationsOpen(false);
                }}
                aria-expanded={menuOpen}
                aria-haspopup="menu"
                className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-left transition hover:bg-slate-100 dark:hover:bg-slate-800/70 cursor-pointer"
              >
                {/* Profile Image */}
                {isLoading ? (
                  <div className="h-9 w-9 animate-pulse rounded-full bg-slate-200 dark:bg-slate-800" />
                ) : user?.imageUrl ? (
                  <img
                    src={user.imageUrl}
                    alt="Profile"
                    className="h-9 w-9 rounded-full object-cover"
                  />
                ) : (
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-400">
                    {user?.firstName?.charAt(0).toUpperCase() ||
                      user?.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                )}

                {/* User Information */}
                <div className="hidden min-w-0 sm:block">
                  {isLoading ? (
                    <>
                      <p className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                      <p className="mt-1 h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                    </>
                  ) : error ? (
                    <p className="max-w-[120px] truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {user?.firstName || user?.email || "User"}
                    </p>
                  ) : (
                    <>
                      <p className="max-w-[130px] truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                        {user?.firstName || user?.email || "User"}
                      </p>
                      <p className="text-xs capitalize text-slate-500 dark:text-slate-400">
                        {user?.plan || "Free"} Plan
                      </p>
                    </>
                  )}
                </div>

                <ChevronDown
                  size={16}
                  className={`text-slate-400 transition-transform duration-200 dark:text-slate-500 ${
                    menuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Dropdown Menu */}
              {menuOpen && (
                <div
                  role="menu"
                  className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-slate-200 bg-white py-1.5 shadow-lg dark:border-slate-800 dark:bg-slate-900"
                >
                  <div className="border-b border-slate-100 px-4 py-2.5 dark:border-slate-800">
                    <p className="truncate text-xs font-semibold text-slate-800 dark:text-slate-200">
                      {user?.firstName
                        ? `${user.firstName} ${user.lastName || ""}`.trim()
                        : user?.email || "User"}
                    </p>
                    {user?.email && (
                      <p className="truncate text-[11px] text-slate-500 dark:text-slate-400">
                        {user.email}
                      </p>
                    )}
                  </div>

                  <Link
                    to="/dashboard"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-indigo-400"
                  >
                    <LayoutDashboard size={16} />
                    Dashboard
                  </Link>

                  <Link
                    to="/settings"
                    role="menuitem"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 hover:text-indigo-600 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-indigo-400"
                  >
                    <Settings size={16} />
                    Settings
                  </Link>

                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />

                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => {
                      setMenuOpen(false);
                      try {
                        localStorage.removeItem("DOCUMIND_QUERY_CACHE");
                        sessionStorage.setItem(AUTH_STATE_KEY, "signed_out");
                        sessionStorage.setItem(
                          PENDING_TOAST_KEY,
                          JSON.stringify({
                            variant: "info",
                            title: "Signed Out",
                            message: "You have been signed out.",
                          })
                        );
                      } catch {
                        // Ignore storage errors
                      }
                      signOut();
                    }}
                    className="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/40 cursor-pointer"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="mx-auto max-w-7xl p-5 sm:p-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
