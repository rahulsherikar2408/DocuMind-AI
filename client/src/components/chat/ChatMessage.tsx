import { useState } from "react";
import { Bot, User, Copy, Check } from "lucide-react";

import SourceReference from "./SourceReference";
import MarkdownRenderer from "../common/MarkdownRenderer";
import { useToast } from "../../hooks/useToast";
import type { ChatMessage as ChatMessageData } from "../../types/chat";

interface ChatMessageProps {
  message: ChatMessageData;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";
  const [copied, setCopied] = useState(false);
  const toast = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      toast.success("Response copied to clipboard!");
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      toast.error("Unable to copy response.");
    }
  };

  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
          isAssistant
            ? "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400"
            : "bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300"
        }`}
      >
        {isAssistant ? <Bot size={19} /> : <User size={19} />}
      </div>

      <div
        className={`min-w-0 max-w-[88%] rounded-2xl p-4 shadow-xs sm:max-w-[78%] ${
          isAssistant
            ? "rounded-tl-none border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            : "rounded-tr-none bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none"
        }`}
      >
        {isAssistant ? (
          <MarkdownRenderer content={message.content} />
        ) : (
          <p className="whitespace-pre-wrap break-words text-sm leading-7">
            {message.content}
          </p>
        )}

        {isAssistant && message.sources && message.sources.length > 0 && (
          <SourceReference sources={message.sources} />
        )}

        <div
          className={`mt-2.5 flex items-center gap-3 text-[10px] ${
            isAssistant
              ? "justify-between text-slate-400 dark:text-slate-500"
              : "justify-end text-indigo-200"
          }`}
        >
          {isAssistant && (
            <button
              type="button"
              onClick={handleCopy}
              title="Copy response"
              className="inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check size={12} className="text-emerald-500" />
                  Copied
                </>
              ) : (
                <>
                  <Copy size={12} />
                  Copy
                </>
              )}
            </button>
          )}

          <span>
            {isAssistant && message.model ? `${message.model} · ` : ""}
            {new Date(message.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>
      </div>
    </div>
  );
}

export default ChatMessage;
