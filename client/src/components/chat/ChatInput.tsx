import { useState } from "react";
import type { KeyboardEvent } from "react";
import { Send } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

function ChatInput({ onSend, disabled = false }: ChatInputProps) {
  const [message, setMessage] = useState("");

  const handleSend = () => {
    const trimmedMessage = message.trim();

    if (!trimmedMessage || disabled) return;

    onSend(trimmedMessage);
    setMessage("");
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex items-end gap-3 rounded-xl border border-slate-200 bg-white p-2 shadow-xs transition focus-within:border-indigo-400 dark:border-slate-800 dark:bg-slate-900 dark:focus-within:border-indigo-500">
      <textarea
        value={message}
        onChange={(event) => setMessage(event.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Ask a question about your document..."
        rows={1}
        disabled={disabled}
        className="max-h-32 min-h-10 flex-1 resize-y bg-transparent px-2 py-2 text-sm text-slate-800 outline-none placeholder:text-slate-400 disabled:opacity-50 dark:text-slate-100 dark:placeholder:text-slate-500"
      />
      <button
        type="button"
        onClick={handleSend}
        disabled={!message.trim() || disabled}
        aria-label="Send message"
        className="rounded-lg bg-indigo-600 p-3 text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
      >
        <Send size={18} />
      </button>
    </div>
  );
}

export default ChatInput;
