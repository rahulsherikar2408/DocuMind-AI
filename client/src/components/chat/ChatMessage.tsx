import { Bot, User } from "lucide-react";
import SourceReference from "./SourceReference";
import type { Source } from "./SourceReference";

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
}

interface ChatMessageProps {
  message: Message;
}

function ChatMessage({ message }: ChatMessageProps) {
  const isAssistant = message.role === "assistant";

  return (
    <div className={`flex gap-3 ${isAssistant ? "" : "flex-row-reverse"}`}>
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${isAssistant ? "bg-indigo-100 text-indigo-600" : "bg-slate-200 text-slate-600"}`}
      >
        {isAssistant ? <Bot size={19} /> : <User size={19} />}
      </div>

      <div
        className={`max-w-[85%] rounded-2xl p-4 sm:max-w-[75%] ${isAssistant ? "rounded-tl-none border border-slate-200 bg-white" : "rounded-tr-none bg-indigo-600 text-white"}`}
      >
        <p className="whitespace-pre-wrap text-sm leading-7">
          {message.content}
        </p>

        {isAssistant && message.sources && (
          <SourceReference sources={message.sources} />
        )}
      </div>
    </div>
  );
}

export default ChatMessage;
