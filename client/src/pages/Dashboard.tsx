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
import StatCard from "../components/common/StatCard";
import UploadCard from "../components/common/UploadCard";
import DocumentTable from "../components/common/DocumentTable";

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

      {/* Statistics */}
      <section className="mb-8 grid gap-5 sm:grid-cols-2 xl:grid-col-4">
        <StatCard
          title="Total Documents"
          value={24}
          description="Documents in your workspace"
          icon={Files}
          color="text-indigo-600"
          bgColor="bg-indigo-50"
        />

        <StatCard
          title="Processed"
          value={20}
          description="Successfully processed documents"
          icon={CheckCircle2}
          color="text-green-600"
          bgColor="bg-green-50"
        />

        <StatCard
          title="Processing"
          value={3}
          description="Documents being processed"
          icon={Clock}
          color="text-amber-600"
          bgColor="bg-amber-50"
        />

        <StatCard
          title="Conversations"
          value={56}
          description="AI conversations created"
          icon={MessageSquare}
          color="text-purple-600"
          bgColor="bg-purple-50"
        />
      </section>

      {/* Upload Section */}
      <section className="mb-8 grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <UploadCard />
        </div>

        <div className="flex flex-col justify-between rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-700 p-7 text-white lg:col-span-2">
          <div>
            <div className="inline-flex rounded-2xl bg-white/15 p-3">
              <Sparkles size={25} />
            </div>

            <h3 className="mt-6 text-xl font-bold">Chat with your Documents</h3>

            <p className="mt-3 text-sm leading-7 text-indigo-100">
              Have questions about your PDFs? Let AI find the information you
              need and provide answers with relevant page references.
            </p>
          </div>

          <Link
            to="/documents"
            className="mt-8 inline-flex w-fit items-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-indigo-700 transition hover:bg-indigo-50"
          >
            Explore Documents
            <ArrowRight size={17} />
          </Link>
        </div>
      </section>

      {/* Recent Documents */}
      <section>
        <DocumentTable />
      </section>
    </DashboardLayout>
  );
}

export default Dashboard;
