import { Link } from "react-router-dom";

import {
  FileText,
  MoreHorizontal,
  MessageSquare,
  Download,
} from "lucide-react";

interface Document {
  id: string;
  name: string;
  date: string;
  size: string;
  pages: number;
  status: "Completed" | "Processing" | "Failed";
}

const documents: Document[] = [
  {
    id: "doc-001",
    name: "Software Engineering Report.pdf",
    date: "Nov 10, 2026",
    size: "2.4 MB",
    pages: 45,
    status: "Completed",
  },
  {
    id: "doc-002",
    name: "Machine Learning Notes.pdf",
    date: "Nov 09, 2026",
    size: "1.8 MB",
    pages: 32,
    status: "Completed",
  },
  {
    id: "doc-003",
    name: "Project Documentation.pdf",
    date: "Nov 09, 2026",
    size: "4.2 MB",
    pages: 86,
    status: "Processing",
  },
  {
    id: "doc-004",
    name: "Database Management.pdf",
    date: "Nov 08, 2026",
    size: "1.2 MB",
    pages: 28,
    status: "Failed",
  },
];

function DocumentTable() {
  const statusStyles = {
    Completed: "bg-green-50 text-green-700",
    Processing: "bg-amber-50 text-amber-700",
    Failed: "bg-red-50 text-red-700",
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 p-5">
        <div>
          <h3 className="font-semibold text-slate-900">Recent Documents</h3>

          <p className="mt-1 text-xs text-slate-500">
            Manage your recently uploaded documents.
          </p>
        </div>

        <Link
          to="/documents"
          className="text-sm font-semibold text-indigo-600 hover:text-indigo-700"
        >
          View All
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[650px] text-left">
          <thead className="bg-slate-50">
            <tr>
              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Document
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Uploaded
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Pages
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Status
              </th>

              <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {documents.map((document) => (
              <tr key={document.id} className="transition hover:bg-slate-50">
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-red-50 p-2.5 text-red-500">
                      <FileText size={20} />
                    </div>

                    <div>
                      <Link
                        to={`/documents/${document.id}`}
                        className="text-sm font-semibold text-slate-800 hover:text-indigo-600"
                      >
                        {document.name}
                      </Link>

                      <p className="mt-1 text-xs text-slate-400">
                        {document.size}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {document.date}
                </td>

                <td className="px-5 py-4 text-sm text-slate-500">
                  {document.pages}
                </td>

                <td className="px-5 py-4">
                  <span
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${statusStyles[document.status]}`}
                  >
                    {document.status}
                  </span>
                </td>

                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <Link
                      to={`/chat/${document.id}`}
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                      title="Chat with document"
                    >
                      <MessageSquare size={17} />
                    </Link>

                    <button
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                      title="Download document"
                    >
                      <Download size={17} />
                    </button>

                    <button
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100"
                      title="More options"
                    >
                      <MoreHorizontal size={18} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {documents.length === 0 && (
        <p className="p-8 text-center text-sm text-slate-500">
          No documents uploaded yet.
        </p>
      )}
    </div>
  );
}

export default DocumentTable;
