import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, FileText } from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import DocumentInfo from "../components/documents/DocumentInfo";
import { useDocument } from "../hooks/useDocuments";

function DocumentDetails() {
  const { id } = useParams<{ id: string }>();

  const { data: document, isLoading, error } = useDocument(id || "");

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[400px] flex-col items-center justify-center">
          <div className="h-9 w-9 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />

          <p className="mt-4 text-sm text-slate-500">
            Loading document details...
          </p>
        </div>
      </DashboardLayout>
    );
  }

  if (error || !document) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <FileText size={40} className="mx-auto text-slate-300" />
          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Document not found
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            This document may have been removed or does not exist.
          </p>
          <Link
            to="/documents"
            className="mt-5 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Back to Documents
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <Link
              to="/documents"
              className="mb-3 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-indigo-600"
            >
              <ArrowLeft size={16} />
              Back to Documents
            </Link>

            <h1 className="text-2xl font-bold text-slate-800">
              Documents Details
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              View information and explore your document.
            </p>
          </div>

          {document.status === "completed" && (
            <Link
              to={`/chat/${document._id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <MessageSquare size={18} />
              Chat with Document
            </Link>
          )}
        </div>

        <DocumentInfo
          document={{
            id: document._id,
            name: document.fileName,
            date: new Date(document.createdAt).toLocaleDateString(),
            size: `${(document.fileSize / (1024 * 1024)).toFixed(2)} MB`,
            pages: document.pageCount,
            status:
              document.status === "completed"
                ? "completed"
                : document.status === "processing" ||
                    document.status === "pending"
                  ? "processing"
                  : "failed",
          }}
        />

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-800">Document Preview</h2>
            <p className="mt-1 text-sm text-slate-500">
              Preview of your uploaded PDF will appear here.
            </p>
          </div>

          <div className="flex min-h-[400px] flex-col items-center justify-center bg-slate-50 p-8 text-center">
            <div className="rounded-2xl bg-white p-6 shadow-sm">
              <FileText size={48} className="text-red-500" />
            </div>

            <h3 className="mt-5 font-semibold text-slate-700">
              PDF Preview Unavailable
            </h3>

            <p className="mt-2 max-w-md text-s, leading-6 text-slate-500">
              The actual PDF preview will be available after we connect document
              storage and PDF viewing functionality.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DocumentDetails;
