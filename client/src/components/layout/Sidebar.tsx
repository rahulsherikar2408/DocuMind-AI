import { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import { useClerk } from "@clerk/react";

import {
  LayoutDashboard,
  Files,
  MessageSquare,
  Settings,
  BrainCircuit,
  HelpCircle,
  LogOut,
  Plus,
  X,
  Crown,
} from "lucide-react";
import { useCurrentSubscription } from "../../hooks/useSubscription";
import ContactSupportModal from "../common/ContactSupportModal";
import { AUTH_STATE_KEY, PENDING_TOAST_KEY } from "../../contexts/toastTypes";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { signOut } = useClerk();
  const { data: subscription } = useCurrentSubscription();
  const [supportOpen, setSupportOpen] = useState(false);
  const currentPlan = subscription?.plan || "free";
  const navigation = [
    {
      name: "Dashboard",
      path: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      name: "My Documents",
      path: "/documents",
      icon: Files,
    },
    {
      name: "Chat History",
      path: "/chat-history",
      icon: MessageSquare,
    },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-xs transition-opacity duration-300 dark:bg-slate-950/70 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-all duration-300 overflow-auto dark:border-slate-800 dark:bg-slate-900 lg:translate-x-0 ${
          isOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo */}
        <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6 py-6 dark:border-slate-800">
          <Link to="/" className="flex items-center gap-2">
            <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-200 dark:shadow-none">
              <BrainCircuit size={23} />
            </div>

            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              DocuMind<span className="text-indigo-600 dark:text-indigo-400"> AI</span>
            </span>
          </Link>

          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 lg:hidden"
            aria-label="Close sidebar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Upload Button */}
        <div className="px-4 py-6">
          <Link
            to="/documents"
            className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700 dark:shadow-none"
          >
            <Plus size={19} />
            Upload Document
          </Link>
        </div>

        {/* Navigation */}
        <div className="flex-1 px-4">
          <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Workspace
          </p>

          <nav className="space-y-1">
            {navigation.map((item) => {
              const Icon = item.icon;

              return (
                <NavLink
                  key={item.path}
                  to={item.path}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                      ${
                        isActive
                          ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                      }`
                  }
                >
                  <Icon size={19} />
                  {item.name}
                </NavLink>
              );
            })}
          </nav>

          <p className="mb-3 mt-9 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
            Preferences
          </p>

          <NavLink
            to="/settings"
            onClick={onClose}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                ${
                  isActive
                    ? "bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-400"
                    : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800/60 dark:hover:text-slate-200"
                }`
            }
          >
            <Settings size={19} />
            Settings
          </NavLink>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-slate-100 p-4 dark:border-slate-800">
          <Link
            to="/settings#subscription"
            onClick={onClose}
            className="mb-3 flex items-center justify-between rounded-xl border border-indigo-100 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 transition hover:border-indigo-300 dark:border-indigo-900/40 dark:bg-slate-800/70 dark:text-slate-200"
          >
            <span className="flex items-center gap-2 capitalize">
              <Crown size={15} className="text-indigo-600 dark:text-indigo-400" />
              {currentPlan} Plan
            </span>
            <span className="text-indigo-600 dark:text-indigo-400">
              {currentPlan === "pro" ? "Pro" : "Upgrade"}
            </span>
          </Link>

          <div className="rounded-xl bg-indigo-50 p-4 dark:border dark:border-indigo-900/40 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400">
              <HelpCircle size={18} />
              <span className="text-sm font-semibold">Need Help?</span>
            </div>

            <p className="mt-2 text-xs leading-5 text-slate-600 dark:text-slate-400">
              Have questions? We're here to help you get started.
            </p>

            <button
              type="button"
              onClick={() => {
                onClose();
                setSupportOpen(true);
              }}
              className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:underline dark:text-indigo-400 cursor-pointer"
            >
              Contact Support
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
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
            className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-red-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-red-400 cursor-pointer"
          >
            <LogOut size={19} />
            Sign Out
          </button>
        </div>
      </aside>

      <ContactSupportModal
        isOpen={supportOpen}
        onClose={() => setSupportOpen(false)}
      />
    </>
  );
}

export default Sidebar;
