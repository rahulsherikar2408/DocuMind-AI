
import { useAuth } from "@clerk/react";
import { useState } from "react";

function AuthTestPage() {
  const { getToken } = useAuth();

  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);

  const testAuthentication = async () => {
    try {
      setLoading(true);
      setResult("");

      const token = await getToken();

      if (!token) {
        throw new Error("Unable to retrieve Clerk token.");
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/api/auth/me`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();

      setResult(JSON.stringify(data, null, 2));
    } catch (error) {
      setResult(
        error instanceof Error ? error.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-5 p-6">
      <h1 className="text-2xl font-bold">Clerk Authentication Test</h1>

      <button
        onClick={testAuthentication}
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-6 py-3 text-white disabled:opacity-50"
      >
        {loading ? "Testing..." : "Test Backend Authentication"}
      </button>

      {result && (
        <pre className="max-w-xl overflow-auto rounded-lg bg-slate-100 p-5 text-sm">
          {result}
        </pre>
      )}
    </div>
  );
}

export default AuthTestPage;
