import { useState, type ReactNode } from "react";
import { Menu, Bell, ChevronDown } from "lucide-react";

import Sidebar from "./Sidebar";
import ThemeToggle from "../common/ThemeToggle";
import { useCurrentUser } from "../../hooks/useUser";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { data: user, isLoading, error } = useCurrentUser();

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
              <span className="font-semibold text-slate-800 dark:text-slate-200">Dashboard</span>
            </div>

            <h1 className="text-lg font-bold text-slate-800 dark:text-slate-100 sm:hidden">
              Dashboard
            </h1>
          </div>

          {/* Right section: Theme Toggle, Notifications & Profile */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Theme Toggle */}
            <ThemeToggle />

            {/* Notifications */}
            <button
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-3 sm:pl-4 dark:border-slate-800">
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
              <div>
                {isLoading ? (
                  <>
                    <p className="h-4 w-24 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
                    <p className="mt-1 h-3 w-16 animate-pulse rounded bg-slate-100 dark:bg-slate-800" />
                  </>
                ) : error ? (
                  <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {user?.firstName || user?.email || "User"}
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">
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
                className="hidden text-slate-400 dark:text-slate-500 sm:block"
              />
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
