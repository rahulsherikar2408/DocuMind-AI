import { useMemo, useState } from "react";
import {
  FileText,
  Upload,
  MessageSquare,
} from "lucide-react";
import { Link } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import DocumentFilters from "../components/documents/DocumentFilters";
import DocumentCard from "../components/documents/DocumentCard";
import DocumentUpload from "../components/documents/DocumentUpload";

import { useDocuments } from "../hooks/useDocuments";
import { useUploadDocument } from "../hooks/useUploadDocument";

import type { ViewMode } from "../components/documents/DocumentFilters";

function Documents() {
  const {
    data: documents = [],
    isLoading,
    error,
  } = useDocuments();

  const uploadMutation = useUploadDocument();

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<string>("all");

  const [view, setView] = useState<ViewMode>("grid");
  const [showUpload, setShowUpload] = useState(false);

  // Filter documents
  const filteredDocuments = useMemo(() => {
    return documents.filter((document) => {
      const matchesSearch = document.fileName
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesStatus =
        status === "all" || document.status === status;

      return matchesSearch && matchesStatus;
    });
  }, [documents, search, status]);

  // Upload selected document
  const handleUpload = async (file: File) => {
    await uploadMutation.mutateAsync(file);

    // Close modal after successful upload
    setShowUpload(false);
  };

  return (
    <DashboardLayout>
      <div className="space-y-7">
        {/* Page Header */}
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800 dark:text-white">
              My Documents
            </h1>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Manage your uploaded documents and start conversations.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white shadow-sm transition hover:bg-indigo-700 cursor-pointer"
          >
            <Upload size={18} />
            Upload Document
          </button>
        </div>

        {/* Document Statistics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Total Documents */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-950/60">
                <FileText
                  className="text-indigo-600 dark:text-indigo-400"
                  size={22}
                />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Total Documents
                </p>

                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {documents.length}
                </h3>
              </div>
            </div>
          </div>

          {/* Completed Documents */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-950/60">
                <FileText
                  className="text-emerald-600 dark:text-emerald-400"
                  size={22}
                />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Completed
                </p>

                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {
                    documents.filter(
                      (doc) => doc.status === "completed"
                    ).length
                  }
                </h3>
              </div>
            </div>
          </div>

          {/* Processing Documents */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="flex items-center gap-3">
              <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-950/60">
                <FileText
                  className="text-amber-600 dark:text-amber-400"
                  size={22}
                />
              </div>

              <div>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Processing
                </p>

                <h3 className="text-2xl font-bold text-slate-800 dark:text-white">
                  {
                    documents.filter(
                      (doc) => doc.status === "processing"
                    ).length
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

        {/* Loading State */}
        {isLoading && (
          <div className="rounded-xl border border-slate-200 bg-white p-10 text-center dark:border-slate-800 dark:bg-slate-900">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600 dark:border-indigo-950 dark:border-t-indigo-500" />

            <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">
              Loading your documents...
            </p>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
            <p className="font-medium text-red-700 dark:text-red-400">
              Unable to load documents.
            </p>

            <p className="mt-1 text-sm text-red-600 dark:text-red-400">
              {error.message}
            </p>
          </div>
        )}

        {/* Document Count */}
        {!isLoading && !error && (
          <div className="flex items-center justify-between">
            <h2 className="font-semibold text-slate-800 dark:text-white">
              All Documents
            </h2>

            <p className="text-sm text-slate-500 dark:text-slate-400">
              {filteredDocuments.length} documents found
            </p>
          </div>
        )}

        {/* Grid View */}
        {!isLoading &&
          !error &&
          view === "grid" &&
          filteredDocuments.length > 0 && (
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {filteredDocuments.map((document) => (
                <DocumentCard
                  key={document._id}
                  document={{
                    id: document._id,
                    name: document.fileName,
                    date: new Date(
                      document.createdAt
                    ).toLocaleDateString(),
                    size: `${(
                      document.fileSize /
                      (1024 * 1024)
                    ).toFixed(2)} MB`,
                    pages: document.pageCount,
                    status:
                      document.status === "completed"
                        ? "completed"
                        : document.status === "processing" ||
                            document.status === "pending"
                          ? "processing"
                          : "failed",
                  }}
                  onDelete={() => {
                    // Delete functionality placeholder
                  }}
                />
              ))}
            </div>
          )}

        {/* Table View */}
        {!isLoading &&
          !error &&
          view === "table" &&
          filteredDocuments.length > 0 && (
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
              <table className="w-full min-w-[750px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                  <tr>
                    <th className="px-5 py-4 font-medium">
                      Document
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Date
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Size
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Pages
                    </th>
                    <th className="px-5 py-4 font-medium">
                      Status
                    </th>
                    <th className="px-5 py-4 text-right font-medium">
                      Actions
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {filteredDocuments.map((document) => {
                    const displayStatus =
                      document.status === "completed"
                        ? "Completed"
                        : document.status === "processing" ||
                            document.status === "pending"
                          ? "Processing"
                          : "Failed";

                    return (
                      <tr
                        key={document._id}
                        className="transition hover:bg-slate-50 dark:hover:bg-slate-800/40"
                      >
                        <td className="px-5 py-4">
                          <Link
                            to={`/documents/${document._id}`}
                            className="flex items-center gap-3 font-medium text-slate-700 hover:text-indigo-600 dark:text-slate-200 dark:hover:text-indigo-400"
                          >
                            <FileText
                              size={20}
                              className="shrink-0 text-red-500 dark:text-red-400"
                            />

                            {document.fileName}
                          </Link>
                        </td>

                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {new Date(
                            document.createdAt
                          ).toLocaleDateString()}
                        </td>

                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {(
                            document.fileSize /
                            (1024 * 1024)
                          ).toFixed(2)}{" "}
                          MB
                        </td>

                        <td className="px-5 py-4 text-slate-500 dark:text-slate-400">
                          {document.pageCount}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-medium ${
                              displayStatus === "Completed"
                                ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400"
                                : displayStatus === "Processing"
                                  ? "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400"
                                  : "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400"
                            }`}
                          >
                            {displayStatus}
                          </span>
                        </td>

                        <td className="px-5 py-4">
                          <div className="flex items-center justify-end gap-4">
                            {document.status === "completed" && (
                              <Link
                                to="/chat"
                                state={{ documentId: document._id }}
                                title="Chat with document"
                                className="text-slate-400 hover:text-indigo-600 dark:text-slate-500 dark:hover:text-indigo-400"
                              >
                                <MessageSquare size={18} />
                              </Link>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

        {/* Empty State */}
        {!isLoading &&
          !error &&
          filteredDocuments.length === 0 && (
            <div className="rounded-xl border border-dashed border-slate-300 bg-white px-5 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
              <FileText
                size={40}
                className="mx-auto text-slate-300 dark:text-slate-600"
              />

              <h3 className="mt-4 font-semibold text-slate-800 dark:text-slate-200">
                No documents found
              </h3>

              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try changing your search or status filter.
              </p>

              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setStatus("all");
                }}
                className="mt-4 text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 cursor-pointer"
              >
                Clear filters
              </button>
            </div>
          )}
      </div>

      {/* Upload Dialog */}
      {showUpload && (
        <DocumentUpload
          onClose={() => setShowUpload(false)}
          onUpload={handleUpload}
          isUploading={uploadMutation.isPending}
        />
      )}
    </DashboardLayout>
  );
}

export default Documents;
