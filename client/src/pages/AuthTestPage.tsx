import { useAuth } from "@clerk/react";
import { useState } from "react";
import ThemeToggle from "../components/common/ThemeToggle";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

function AuthTestPage() {
  const { getToken } = useAuth();

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testAPI = async (endpoint: string) => {
    try {
      setLoading(true);
      setResult("");

      const token = await getToken();

      if (!token) {
        throw new Error("Unable to retrieve authentication token.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}${endpoint}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setResult(
        JSON.stringify(
          {
            status: response.status,
            ...data,
          },
          null,
          2
        )
      );
    } catch (error) {
      setResult(
        error instanceof Error ? error.message : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 text-slate-900 transition-colors duration-200 dark:bg-slate-950 dark:text-slate-100">
      <div className="mx-auto max-w-2xl space-y-5">
        <div className="flex items-center justify-between">
          <Link
            to="/dashboard"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
          >
            <ArrowLeft size={16} />
            Back to Dashboard
          </Link>
          <ThemeToggle />
        </div>

        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          DocuMind AI API Testing
        </h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => testAPI("/api/users/me")}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white transition hover:bg-indigo-700 disabled:opacity-50 cursor-pointer"
          >
            Test User API
          </button>

          <button
            onClick={() => testAPI("/api/documents")}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-3 font-medium text-white transition hover:bg-emerald-700 disabled:opacity-50 cursor-pointer"
          >
            Test Documents API
          </button>
        </div>

        {loading && <p className="text-sm text-slate-500 dark:text-slate-400">Testing API...</p>}

        {result && (
          <pre className="overflow-auto rounded-lg border border-slate-200 bg-slate-900 p-5 text-sm text-green-400 dark:border-slate-800">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}

export default AuthTestPage;
