import {
  Files,
  CheckCircle2,
  Clock,
  MessageSquare,
  ArrowRight,
  Sparkles,
} from "lucide-react";

import { Link } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";

function Dashboard() {
  return (
    <DashboardLayout>

      {/* Welcome Section */}
      <section className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">

        <div>
          <div className="flex items-center gap-2 text-sm font-medium text-indigo-600">
            <Sparkles size={16} />
            Your AI Workspace
          </div>

          <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Welcome back, Rahul!
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Manage your documents and continue exploring with AI.
          </p>
        </div>

        <Link
          to="/documents"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-100 transition hover:bg-indigo-700"
        >
          <Files size={18} />
          Manage Documents
          <ArrowRight size={17} />
        </Link>

      </section>
    </DashboardLayout>
  );
}

export default Dashboard;
