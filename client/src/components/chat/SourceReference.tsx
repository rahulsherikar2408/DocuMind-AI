import { FileText } from "lucide-react";
import type { ChatDocument } from "../../types/chat";

export interface Source {
  document: string | ChatDocument;
  pageNumber: number;
  chunkIndex: number;
  score: number;
}

interface SourceReferenceProps {
  sources: Source[];
}

function SourceReference({ sources }: SourceReferenceProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400 dark:text-slate-500">
        Sources
      </p>

      <div className="space-y-2">
        {sources.map((source, index) => {
          const document =
            typeof source.document === "object" &&
            source.document !== null
              ? source.document
              : null;

          return (
            <div
              key={`${source.document}-${source.pageNumber}-${source.chunkIndex}-${index}`}
              className="rounded-lg border border-indigo-100 bg-indigo-50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/40"
            >
              <div className="flex items-start gap-2">
                <FileText
                  size={15}
                  className="mt-0.5 shrink-0 text-indigo-600 dark:text-indigo-400"
                />

                <div>
                  <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">
                    Page {source.pageNumber}
                  </p>

                  {document?.fileName && (
                    <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
                      {document.fileName}
                    </p>
                  )}

                  <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                    Source section {source.chunkIndex + 1}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default SourceReference;
