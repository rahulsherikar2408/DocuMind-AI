
import { useAuth } from "@clerk/react";
import { useState } from "react";

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
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-2xl space-y-5">
        <h1 className="text-2xl font-bold text-slate-900">
          DocuMind AI API Testing
        </h1>

        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => testAPI("/api/users/me")}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-5 py-3 text-white disabled:opacity-50"
          >
            Test User API
          </button>

          <button
            onClick={() => testAPI("/api/documents")}
            disabled={loading}
            className="rounded-lg bg-emerald-600 px-5 py-3 text-white disabled:opacity-50"
          >
            Test Documents API
          </button>
        </div>

        {loading && <p>Testing API...</p>}

        {result && (
          <pre className="overflow-auto rounded-lg bg-slate-900 p-5 text-sm text-green-400">
            {result}
          </pre>
        )}
      </div>
    </div>
  );
}

export default AuthTestPage;
