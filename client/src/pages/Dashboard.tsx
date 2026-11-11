
import { Link } from "react-router-dom";

function Dashboard() {
  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-6xl">
        <Link to="/" className="font-bold text-indigo-600">
          DocuMind AI
        </Link>

        <h1 className="mt-10 text-3xl font-bold">
          Welcome to your Dashboard
        </h1>

        <p className="mt-3 text-slate-600">
          Your personal document workspace.
        </p>

        <Link
          to="/documents"
          className="mt-6 inline-block rounded-lg bg-indigo-600 px-5 py-3 text-white"
        >
          View Documents
        </Link>
      </div>
    </div>
  );
}

export default Dashboard;
