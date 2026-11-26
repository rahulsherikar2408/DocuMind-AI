import { Bot, User } from "lucide-react";

import SourceReference from "./SourceReference";
import type { ChatMessage as ChatMessageData } from "../../types/chat";

interface ChatMessageProps {
  message: ChatMessageData;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

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
        className={`max-w-[85%] rounded-2xl p-4 shadow-xs sm:max-w-[75%] ${
          isAssistant
            ? "rounded-tl-none border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
            : "rounded-tr-none bg-indigo-600 text-white shadow-indigo-100 dark:shadow-none"
        }`}
      >
        <p className="whitespace-pre-wrap text-sm leading-7">
          {message.content}
        </p>

        {isAssistant && message.sources && message.sources.length > 0 && (
          <SourceReference sources={message.sources} />
        )}

        <p
          className={`mt-2 text-right text-[10px] ${
            isAssistant ? "text-slate-400 dark:text-slate-500" : "text-indigo-200"
          }`}
        >
          {isAssistant && message.model ? `${message.model} · ` : ""}
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

export default ChatMessage;
