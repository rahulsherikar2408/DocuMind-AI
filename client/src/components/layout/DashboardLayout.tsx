import { useState, type ReactNode } from "react";
import { Menu, Search, Bell, ChevronDown } from "lucide-react";

import Sidebar from "./Sidebar";

interface DashboardLayoutProps {
  children: ReactNode;
}

function DashboardLayout({ children }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      {/* Main Content */}
      <div className="min-h-screen lg:pl-64">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-20 items-center justify-between border-b border-slate-200 bg-white/90 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 lg:hidden"
              aria-label="Open sidebar"
            >
              <Menu size={22} />
            </button>

            <div className="hidden items-center gap-2 text-sm text-slate-400 sm:flex">
              <span>Workspace</span>
              <span>/</span>
              <span className="font-semibold text-slate-800">Dashboard</span>
            </div>

            <h1 className="text-lg font-bold text-slate-800 sm:hidden">
              Dashboard
            </h1>
          </div>

          {/* Search */}
          <div className="hidden w-full max-w-sm items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 md:flex">
            <Search size={18} className="text-slate-400" />

            <input
              type="text"
              placeholder="Search documents..."
              className="w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
            />

            <span className="rounded border border-slate-200 bg-white px-2 py-1 text-xs text-slate-400">
              Ctrl K
            </span>
          </div>

          {/* Profile */}
          <div className="flex items-center gap-3">
            <button
              className="relative rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100"
              aria-label="Notifications"
            >
              <Bell size={20} />
              <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-500" />
            </button>

            <div className="flex items-center gap-2 border-l border-slate-200 pl-4">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-700">
                R
              </div>

              <div className="hidden sm:block">
                <p className="text-sm font-semibold text-slate-800">Rahul</p>
                <p className="text-xs text-slate-500">Free Plan</p>
              </div>

              <ChevronDown
                size={16}
                className="hidden text-slate-400 sm:block"
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
