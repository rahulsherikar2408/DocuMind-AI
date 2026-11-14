import { FileText, Calendar, HardDrive, Files } from "lucide-react";
import type { Document } from "../../types/document";

interface DocumentInfoProps {
    document: Document;
}

function DocumentInfo({ document }: DocumentInfoProps) {

    const statusStyles = {
        Completed: "bg-emerald-50 text-emerald-700",
        Processing: "bg-amber-50 text-amber-700",
        Failed: "bg-red-50 text-red-700",
    }

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-4">
                <div className="rounded-xl bg-red-50 p-4">
                    <FileText size={30} className="text-red-500" />
                </div>

                <div className="min-w-0">
                    <h2 className="truncate text-ls font-semibold text-slate-800">
                        {document.name}
                    </h2>
                    <p className="mt-1 text-sm text-slate-500">
                        PDF Document
                    </p>
                </div>
            </div>

            <span className={`w-fit rounded-full px-3 py-1.5 text-xs font-medium ${statusStyles[document.status]}`}>
                {document.status}
            </span>
        </div>

        <div className="mt-6 grid-cols-1 gap-4 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <div className="flex items-center gap-3">
                <HardDrive size={19} className="text-slate-400" />
                <div>
                    <p className="text-xs text-slate-400">File Size</p>
                    <p className="text-sm font-medium text-slate-700">{document.size}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Files size={19} className="text-slate-400" />
                <div>
                    <p className="text-xs text-slate-400">Pages</p>
                    <p className="text-sm font-medium text-slate-700">{document.pages}</p>
                </div>
            </div>

            <div className="flex items-center gap-3">
                <Calendar size={19} className="text-slate-400" />
                <div>
                    <p className="text-xs text-slate-400">Uploaded</p>
                    <p className="text-sm font-medium text-slate-700">{document.date}</p>
                </div>
            </div>
        </div>
    </div>
  );
}

export default DocumentInfo;