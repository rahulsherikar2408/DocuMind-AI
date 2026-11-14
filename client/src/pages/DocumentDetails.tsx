import { useParams, Link } from "react-router-dom";
import { ArrowLeft, MessageSquare, FileText } from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import DocumentInfo from "../components/documents/DocumentInfo";
import type { Document } from "../types/document";

const sampleDocuments: Document[] = [
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

function DocumentDetails() {
  const { id } = useParams<{ id: string }>();

  const document = sampleDocuments.find((doc) => doc.id === id);

  if(!document) {
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

          {document.status === "Completed" && (
            <Link
              to={`/chat/${document.id}`}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              <MessageSquare size={18} />
              Chat with Document
            </Link>
          )}
        </div>

        <DocumentInfo document={document} />

        <div className="rounded-xl border border-slate-200 bg-white">
          <div className="border-b border-slate-100 px-6 py-4">
            <h2 className="font-semibold text-slate-800">
              Document Preview
            </h2>
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
              The actual PDF preview will be available after we connect document storage and PDF viewing functionality.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DocumentDetails;
