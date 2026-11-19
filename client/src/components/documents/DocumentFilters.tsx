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
          className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          type="text"
          value={search}
          onChange={(event) => onSearchChange(event.target.value)}
          placeholder="Search documents..."
          className="w-full rounded-lg border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm outline-none transition focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100"
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <select
          value={status}
          onChange={(event) => onStatusChange(event.target.value)}
          className="rounded-lg border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-600 outline-none focus:border-indigo-400"
        >
          <option value="all">All Status</option>
          <option value="completed">Completed</option>
          <option value="processing">Processing</option>
          <option value="failed">Failed</option>
        </select>

        <div className="flex rounded-lg border border-slate-200 bg-white p-1">
          <button
            type="button"
            title="Grid view"
            onClick={() => onViewChange("grid")}
            className={`rounded-md p-2 
                        ${
                          view === "grid"
                            ? "bg-indigo-50 text-indigo-600"
                            : "text-slate-400 hover:text-slate-700"
                        }  
                      `}
          >
            <LayoutGrid size={18} />
          </button>

          <button
            type="button"
            title="Table view"
            onClick={() => onViewChange("table")}
            className={`rounded-md p-2 
                         ${
                           view === "table"
                             ? "bg-indigo-50 text-indigo-600"
                             : "text-slate-400 hover:text-slate-700"
                         } 
                      `}
          >
            <List size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentFilters;
