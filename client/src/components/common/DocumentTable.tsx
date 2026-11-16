import { Link } from "react-router-dom";

import {
  FileText,
  MoreHorizontal,
  MessageSquare,
  Download,
} from "lucide-react";

import { useDocuments } from "../../hooks/useDocuments";

function DocumentTable() {
  const { data: documents = [], isLoading, error } = useDocuments();

  const statusStyles = {
    completed: "bg-green-50 text-green-700",
    processing: "bg-amber-50 text-amber-700",
    pending: "bg-amber-50 text-amber-700",
    failed: "bg-red-50 text-red-700",
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
        <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

        <p className="mt-3 text-sm text-slate-500">
          Loading your recent uploaded documents...
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white">
      {/* Header */}
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

      {error && !isLoading ? (
        <div className="rounded-b-2xl border border-red-200 bg-red-50 p-6 text-center">
          <p className="font-medium text-red-700">Unable to Load documents.</p>
          <p className="mt-1 text-sm text-red-600">
            Please check your connection and try again.
          </p>
        </div>
      ) : (
      //  Document Table
      documents.length > 0 ? (
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
                <tr key={document._id} className="transition hover:bg-slate-50">
                  {/* Document Name and Size */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className="rounded-lg bg-red-50 p-2.5 text-red-500">
                        <FileText size={20} />
                      </div>

                      <div>
                        <Link
                          to={`/documents/${document._id}`}
                          className="text-sm font-semibold text-slate-800 hover:text-indigo-600"
                        >
                          {document.fileName}
                        </Link>

                        <p className="mt-1 text-xs text-slate-400">
                          {(document.fileSize / (1024 * 1024)).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                  </td>

                  {/* Upload Date */}
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {new Date(document.createdAt).toLocaleDateString()}
                  </td>

                  {/* Page Count */}
                  <td className="px-5 py-4 text-sm text-slate-500">
                    {document.pageCount || "-"}
                  </td>

                  {/* Document Status */}
                  <td className="px-5 py-4">
                    <span
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        statusStyles[document.status]
                      }`}
                    >
                      {document.status.charAt(0).toUpperCase() +
                        document.status.slice(1)}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2">
                      {document.status === "completed" && (
                        <Link
                          to={`/chat/${document._id}`}
                          className="rounded-lg p-2 text-slate-500 transition hover:bg-indigo-50 hover:text-indigo-600"
                          title="Chat with document"
                        >
                          <MessageSquare size={17} />
                        </Link>
                      )}

                      <button
                        type="button"
                        disabled={!document.storageUrl}
                        onClick={() => {
                          if (document.storageUrl) {
                            window.open(
                              document.storageUrl,
                              "_blank",
                              "noopener,noreferrer",
                            );
                          }
                        }}
                        className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-40"
                        title="Download document"
                      >
                        <Download size={17} />
                      </button>

                      <button
                        type="button"
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
      ) : (
        // Empty State
        <div className="px-5 py-12 text-center">
          <FileText size={36} className="mx-auto text-slate-300" />

          <h3 className="mt-3 font-semibold text-slate-800">
            No documents uploaded yet
          </h3>

          <p className="mt-1 text-sm text-slate-500">
            Upload your first PDF to start using DocuMind AI.
          </p>

          <Link
            to="/documents"
            className="mt-4 inline-flex text-sm font-semibold text-indigo-600 hover:text-indigo-700"
          >
            Go to My Documents
          </Link>
        </div>
      ))}
    </div>
  );
}

export default DocumentTable;
