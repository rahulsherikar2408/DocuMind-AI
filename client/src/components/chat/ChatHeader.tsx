import { FileText, ArrowLeft, Sparkles, Cpu, Lock } from "lucide-react";
import { Link } from "react-router-dom";
import {
  useCurrentSubscription,
  useUpdateSelectedModel,
} from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";
import type { GeminiModelId } from "../../services/userService";

interface ChatHeaderProps {
  documentName: string;
}

const MODEL_OPTIONS: { id: GeminiModelId; label: string }[] = [
  { id: "gemini-3.1-flash-lite", label: "Gemini 3.1 Flash Lite" },
  { id: "gemini-3.5-flash-lite", label: "Gemini 3.5 Flash Lite" },
];

function ChatHeader({ documentName }: ChatHeaderProps) {
  const { data: subscription } = useCurrentSubscription();
  const updateModelMutation = useUpdateSelectedModel();
  const toast = useToast();

  const plan = subscription?.plan || "free";
  const canSwitchModels = plan === "pro";
  const activeModel = subscription?.selectedModel || "gemini-3.1-flash-lite";

  const handleModelChange = (model: GeminiModelId) => {
    if (!canSwitchModels || model === activeModel) return;
    updateModelMutation.mutate(model, {
      onSuccess: () => {
        toast.success(`Switched AI model to ${model}`, "Model Updated");
      },
      onError: () => {
        toast.error("Unable to switch AI model.", "Model Error");
      },
    });
  };

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

      <div className="flex flex-wrap items-center gap-2.5">
        {canSwitchModels ? (
          <div className="flex items-center gap-2 rounded-lg border border-indigo-200 bg-indigo-50/70 px-3 py-1.5 dark:border-indigo-900/60 dark:bg-indigo-950/40">
            <Cpu size={15} className="text-indigo-600 dark:text-indigo-400" />
            <select
              aria-label="Select Gemini model"
              value={activeModel}
              disabled={updateModelMutation.isPending}
              onChange={(e) =>
                handleModelChange(e.target.value as GeminiModelId)
              }
              className="bg-transparent text-xs font-semibold text-indigo-700 outline-none dark:text-indigo-300 cursor-pointer"
            >
              {MODEL_OPTIONS.map((option) => (
                <option
                  key={option.id}
                  value={option.id}
                  className="bg-white text-slate-800 dark:bg-slate-900 dark:text-slate-100"
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        ) : (
          <Link
            to="/settings#subscription"
            title="Upgrade to Pro to switch between Gemini models"
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 transition hover:border-indigo-300 hover:text-indigo-600 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-300 dark:hover:border-indigo-700 dark:hover:text-indigo-400"
          >
            <Cpu size={14} />
            <span>{activeModel}</span>
            <Lock size={11} className="text-slate-400" />
          </Link>
        )}

        <div className="flex w-fit items-center gap-2 rounded-lg bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300">
          <Sparkles size={16} />
          DocuMind AI Assistant
        </div>
      </div>
    </div>
  );
}

export default ChatHeader;
