import { FileText, MessageSquare, Trash2 } from "lucide-react";
import { Link } from "react-router-dom";
import type { Document } from "../../types/document";

interface DocumentCardProps {
  document: Document;
  onDelete: (id: string) => void;
}

function DocumentCard({ document, onDelete }: DocumentCardProps) {
  const statusStyles = {
    Completed: "bg-emerald-50 text-emerald-700",
    Processing: "bg-amber-50 text-amber-700",
    Failed: "bg-red-50 text-red-700",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
      <div className="flex items-start justify-between">
        <div className="rounded-xl bg-red-50 p-3">
          <FileText size={25} className="text-red-500" />
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs font-medium ${statusStyles[document.status]}`}
        >
          {document.status}
        </span>
      </div>

      <h3 className="mt-5 truncate font-semibold text-slate-800">
        {document.name}
      </h3>

      <p className="mt-2 text-sm text-slate-500">
        {document.size} · {document.pages} pages
      </p>

      <p className="mt-1 text-xs text-slate-400">Uploaded {document.date}</p>

      <div className="mt-5 flex items-center justify-between border-t border-slate-100 pt-4">
        <Link
          to={`/documents/${document.id}`}
          className="text-sm font-medium text-indigo-600 hover:text-indigo-700"
        >
          View details
        </Link>

        <div className="flex items-center gap-3">
          <Link
            to={`/chat/${document.id}`}
            title="Chat with document"
            className="text-slate-400 transition hover:text-indigo-600"
          >
            <MessageSquare size={18} />
          </Link>

          <button
            type="button"
            title="Delete document"
            onClick={() => onDelete(document.id)}
            className="text-slate-400 transition hover:text-red-600"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default DocumentCard;
