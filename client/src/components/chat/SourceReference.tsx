import { FileText } from "lucide-react";

export interface Source {
  page: number;
  excerpt: string;
}

interface SourceReferenceProps {
  sources: Source[];
}

function SourceReference({ sources }: SourceReferenceProps) {
  if (sources.length === 0) return null;

  return (
    <div className="mt-4 border-t border-slate-100 pt-3">
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
        Sources
      </p>

      <div className="flex flex-wrap gap-2">
        {sources.map((source, index) => (
          <div
            key={`${source.page}-${index}`}
            title={source.excerpt}
            className="inline-flex items-center gap-1.5 rounded-lg border border-indigo-100 bg-indigo-50 px-3 py-2 text-xs font-medium text-indigo-700"
          >
            <FileText size={14} />
            Page {source.page}
          </div>
        ))}
      </div>

      <div className="mt-3 space-y-2">
        {sources.map((source, index) => (
          <p
            key={`${source.page}-excerpt-${index}`}
            className="rounded=lg bg-slate-50 p-3 text-xs leading-5 text-slate-600"
          >
            <span className="font-semibold text-slate-700">
              Page {source.page}:
            </span>{" "}
            {source.excerpt}
          </p>
        ))}
      </div>
    </div>
  );
}

export default SourceReference;
