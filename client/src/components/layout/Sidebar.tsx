import { NavLink, Link } from "react-router-dom";

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
} from "lucide-react";

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

function Sidebar({ isOpen, onClose }: SidebarProps) {

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
                className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
                onClick={onClose}
            />
        )}

        <aside className={`fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-slate-200 bg-white transition-transform duration-300 overflow-auto lg:translate-x-0 ${isOpen ? "translate-x-0" : "-translate-x-full"}`}>
            {/* Logo */}
            <div className="flex h-20 items-center justify-between border-b border-slate-100 px-6 py-6">
                <Link to="/" className="flex items-center gap-2">
                    <div className="rounded-xl bg-indigo-600 p-2 text-white">
                        <BrainCircuit size={23} />
                    </div>

                    <span className="text-xl font-bold tracking-tight text-slate-900">
                        DocuMind<span className="text-indigo-600"> AI</span>
                    </span>
                </Link>

                <button
                    onClick={onClose}
                    className="rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
                    aria-label="Close sidebar"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Upload Button */}
            <div className="px-4 py-6">
                <Link to="/documents" className="flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700">
                    <Plus size={19} />
                    Upload Document
                </Link>
            </div>

            {/* Navigation */}
            <div className="flex-1 px-4">
                <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
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
                                          ? "bg-indigo-50 text-indigo-700"
                                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                                    }`
                                }
                            >
                                <Icon size={19} />
                                {item.name}
                            </NavLink>
                        );
                    })}
                </nav>

                <p className="mb-3 mt-9 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Preferences
                </p>

                <NavLink 
                    to="/settings"
                    onClick={onClose}
                    className={({ isActive }) => 
                        `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium transition
                        ${
                            isActive
                              ? "bg-indigo-50 text-indigo-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                        }`
                    }
                >
                    <Settings size={19} />
                    Settings
                </NavLink>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-slate-100 p-4">
                <div className="rounded-xl bg-indigo-50 p-4">
                    <div className="flex items-center gap-2 text-indigo-700">
                        <HelpCircle size={18} />
                        <span className="text-sm font-semibold">
                            Need Help?
                        </span>
                    </div>

                    <p className="mt-2 text-xs leading-5 text-slate-600">
                        Have questions? We're here to help you get started.
                    </p>

                    <a href="mailto:sherikarrahul59@gmail.com" className="mt-3 inline-block text-xs font-semibold text-indigo-600 hover:underline">
                        Contact Support
                    </a>
                </div>

                <button className="mt-4 flex w-full items-center gap-3 rounded-xl px-3 py-3 text-sm font-medium text-slate-600 hover:bg-slate-50">
                    <LogOut size={19} />
                    Sign Out
                </button>
            </div>
        </aside>
    </>
  );
}

export default Sidebar;