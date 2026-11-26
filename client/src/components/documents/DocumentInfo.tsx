import { FileText, Calendar, HardDrive, Files } from "lucide-react";
import type { Document } from "../../types/document";

interface DocumentInfoProps {
  document: Document;
}

function DocumentInfo({ document }: DocumentInfoProps) {
  const statusStyles = {
    completed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400",
    processing: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    pending: "bg-amber-50 text-amber-700 dark:bg-amber-950/60 dark:text-amber-400",
    failed: "bg-red-50 text-red-700 dark:bg-red-950/60 dark:text-red-400",
  };

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-4">
          <div className="rounded-xl bg-red-50 p-4 dark:bg-red-950/60">
            <FileText size={30} className="text-red-500 dark:text-red-400" />
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-slate-800 dark:text-slate-100">
              {document.name}
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              {document.extractionMethod === "ocr" || document.isScanned
                ? "Scanned Document (OCR Processed)"
                : "PDF Document"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {(document.extractionMethod === "ocr" || document.isScanned) && (
            <span className="w-fit rounded-full bg-indigo-50 px-3 py-1.5 text-xs font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
              OCR
            </span>
          )}
          <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium capitalize ${statusStyles[document.status]}`}>
            {document.status}
          </span>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 border-t border-slate-100 pt-5 dark:border-slate-800 sm:grid-cols-3">
        <div className="flex items-center gap-3">
          <HardDrive size={19} className="text-slate-400 dark:text-slate-500" />
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">File Size</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{document.size}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Files size={19} className="text-slate-400 dark:text-slate-500" />
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Pages</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{document.pages}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Calendar size={19} className="text-slate-400 dark:text-slate-500" />
          <div>
            <p className="text-xs text-slate-400 dark:text-slate-500">Uploaded</p>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-200">{document.date}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DocumentInfo;
