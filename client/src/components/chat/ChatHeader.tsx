import { FileText, ArrowLeft, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";

interface ChatHeaderProps {
  documentName: string;
}

function ChatHeader({ documentName }: ChatHeaderProps) {
  return (
    <div className="flex flex-col justify-between gap-4 border-b border-slate-200 bg-white px-5 py-4 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center">
      <div className="flex min-w-0 items-center gap-3">
        <Link
          to="/documents"
          title="Back to documents"
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-indigo-600 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-indigo-400"
        >
          <ArrowLeft size={19} />
        </Link>

        <div className="rounded-lg bg-red-50 p-2.5 dark:bg-red-950/60">
          <FileText size={22} className="text-red-500 dark:text-red-400" />
        </div>

        <div className="min-w-0">
          <h2 className="truncate font-semibold text-slate-800 dark:text-white">
            {documentName}
          </h2>
          <p className="mt-1 flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Ready to answer
          </p>
        </div>
      </div>

      <div className="flex w-fit items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
        <Sparkles size={16} />
        DocuMind AI Assistant
      </div>
    </div>
  );
}

export default ChatHeader;
