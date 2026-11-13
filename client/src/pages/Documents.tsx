import { useMemo, useState } from "react";
import { FileText, Upload, MessageSquare, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import DocumentFilters from "../components/documents/DocumentFilters";
import DocumentCard from "../components/documents/DocumentCard";
import DocumentUpload from "../components/documents/DocumentUpload";

import type { Document } from "../types/document";
import type { ViewMode } from "../components/documents/DocumentFilters";

const initialDocuments: Document[] = [
  {
    id: "1",
    name: "Software Engineering Report.pdf",
    date: "Nov 10, 2026",
    size: "2.4 MB",
    pages: 45,
    status: "Completed",
  },
  {
    id: "2",
    name: "Machine Learning Notes.pdf",
    date: "Nov 09, 2026",
    size: "1.8 MB",
    pages: 32,
    status: "Completed",
  },
  {
    id: "3",
    name: "Project Documentation.pdf",
    date: "Nov 09, 2026",
    size: "4.2 MB",
    pages: 86,
    status: "Processing",
  },
  {
    id: "4",
    name: "Database Management.pdf",
    date: "Nov 08, 2026",
    size: "1.2 MB",
    pages: 28,
    status: "Failed",
  },
  {
    id: "5",
    name: "React Development Guide.pdf",
    date: "Nov 07, 2026",
    size: "3.1 MB",
    pages: 64,
    status: "Completed",
  },
  {
    id: "6",
    name: "System Design Interview.pdf",
    date: "Nov 06, 2026",
    size: "2.7 MB",
    pages: 51,
    status: "Completed",
  },
];

function Documents() {
  const [documents, setDocuments] = useState<Document[]>(initialDocuments);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"All" | Document["status"]>("All");
  const [view, setView] = useState<ViewMode>("grid");
  const [showUpload, setShowUpload] = useState(false);

  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch = document.name
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus = status === "All" || document.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [documents, search, status]);

  const handleDelete = (id: string) => {
    setDocuments((currentDocuments) =>
      currentDocuments.filter((document) => document.id !== id),
    );
  };

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Documents</h1>
            <p className="mt-1 text-sm text-slate-500">
              Manage your uploaded documents and start conversations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            <Upload size={18} />
            Upload Document
          </button>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-3">
                <FileText className="text-indigo-600" size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Total Documents</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {Documents.length}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-3">
                <FileText className="text-emerald-600" size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Completed</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {documents.filter((doc) => doc.status === "Completed").length}
                </h3>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-3">
                <FileText className="text-amber-600" size={22} />
              </div>
              <div>
                <p className="text-sm text-slate-500">Processing</p>
                <h3 className="text-2xl font-bold text-slate-800">
                  {
                    documents.filter((doc) => doc.status === "Processing")
                      .length
                  }
                </h3>
              </div>
            </div>
          </div>
        </div>

        {/* Search and Filters */}
        <DocumentFilters
          search={search}
          status={status}
          view={view}
          onSearchChange={setSearch}
          onStatusChange={setStatus}
          onViewChange={setView}
        />

        {/* Document Count */}
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-slate-800">All Documents</h2>
          <p className="text-sm text-slate-500">
            {filteredDocuments.length} documents found
          </p>
        </div>

        {/* Grid View */}
        {view === "grid" && filteredDocuments.length > 0 && (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {filteredDocuments.map((document) => (
              <DocumentCard
                key={document.id}
                document={document}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}

        {/* Table View */}
        {view === "table" && filteredDocuments.length > 0 && (
          <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
            <table className="w-full min-w-[750px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-medium">Document</th>
                  <th className="px-5 py-4 font-medium">Date</th>
                  <th className="px-5 py-4 font-medium">Size</th>
                  <th className="px-5 py-4 font-medium">Pages</th>
                  <th className="px-5 py-4 font-medium">Status</th>
                  <th className="px-5 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {filteredDocuments.map((document) => (
                  <tr
                    key={document.id}
                    className="transition hover:bg-slate-50"
                  >
                    <td className="px-5 py-4">
                      <Link
                        to={`/documents/${document.id}`}
                        className="flex items-center gap-3 font-medium text-slate-700 hover:text-indigo-600"
                      >
                        <FileText size={20} className="shrink-0 text-red-500" />
                        {document.name}
                      </Link>
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {document.date}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {document.size}
                    </td>

                    <td className="px-5 py-4 text-slate-500">
                      {document.pages}
                    </td>

                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          document.status === "Completed"
                            ? "bg-emerald-50 text-emerald-700"
                            : document.status === "Processing"
                              ? "bg-amber-50 text-amber-700"
                              : "bg-red-50 text-red-700"
                        }`}
                      >
                        {document.status}
                      </span>
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-4">
                        <Link
                          to={`/chat/${document.id}`}
                          title="Chat with document"
                          className="text-slate-400 hover:text-indigo-600"
                        >
                          <MessageSquare size={18} />
                        </Link>

                        <button
                          type="button"
                          title="Delete document"
                          onClick={() => handleDelete(document.id)}
                          className="text-slate-400 hover:text-red-600"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Empty State */}
        {filteredDocuments.length === 0 && (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center">
            <FileText size={40} className="mx-auto text-slate-300" />

            <h3 className="mt-4 font-semibold text-slate-800">
              No documents found
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Try changing your search or status filter.
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setStatus("All");
              }}
              className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {/* Upload Dialog */}
      {showUpload && <DocumentUpload onClose={() => setShowUpload(false)} />}
    </DashboardLayout>
  );
}

export default Documents;
