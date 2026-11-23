import { LayoutGrid, List, Search } from "lucide-react";

export type ViewMode = "grid" | "table";

interface DocumentFiltersProps {
  search: string;
  status: string;
  view: ViewMode;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onViewChange: (value: ViewMode) => void;
}

function DocumentFilters({
  search,
  status,
  view,
  onSearchChange,
  onStatusChange,
  onViewChange,
}: DocumentFiltersProps) {
  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
      <div className="relative w-full lg:max-w-md">
        <Search
          size={18}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search documents..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:ring-indigo-900/30"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300 dark:focus:border-indigo-500"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1 dark:border-slate-800 dark:bg-slate-900">
          <button
            type="button"
            title="Grid view"
            onClick={() => onViewChange("grid")}
            className={`rounded-md p-2 transition cursor-pointer ${
              view === "grid"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
            }`}
          >
            <LayoutGrid size={18} />
          </button>

          <button
            type="button"
            title="Table view"
            onClick={() => onViewChange("table")}
            className={`rounded-md p-2 transition cursor-pointer ${
              view === "table"
                ? "bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400"
                : "text-slate-400 hover:text-slate-700 dark:text-slate-500 dark:hover:text-slate-200"
            }`}
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentFilters;
