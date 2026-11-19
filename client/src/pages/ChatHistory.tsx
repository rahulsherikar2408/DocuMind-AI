import { Link } from "react-router-dom";

import {
  MessageSquare,
  FileText,
  Clock,
  Plus,
  LoaderCircle,
  AlertCircle,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { useChats } from "../hooks/useChats";

function ChatHistory() {
  const {
    data: chats = [],
    isLoading,
    isError,
    refetch,
  } = useChats();

  return (
    <DashboardLayout>
      <div className="space-y-6">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              Chat History
            </h1>

            <p className="mt-1 text-sm text-gray-500">
              View and continue your previous conversations.
            </p>
          </div>

          <Link
            to="/chat"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition"
          >
            <Plus size={18} />
            New Chat
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoaderCircle
              size={32}
              className="animate-spin text-indigo-600"
            />

            <p className="mt-3 text-sm text-gray-500">
              Loading your conversations...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle
              size={32}
              className="mx-auto text-red-500"
            />

            <p className="mt-3 font-medium text-red-700">
              Unable to load chat history.
            </p>

            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && chats.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
            <MessageSquare
              size={42}
              className="mx-auto text-gray-400"
            />

            <h2 className="mt-4 text-lg font-semibold text-gray-900">
              No conversations yet
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              Start a conversation with your uploaded documents.
            </p>

            <Link
              to="/chat"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
            >
              <Plus size={18} />
              Start a Conversation
            </Link>
          </div>
        )}

        {/* Chat List */}
        {!isLoading && !isError && chats.length > 0 && (
          <div className="space-y-3">
            {chats.map((chat) => {
              const document =
                typeof chat.document === "object"
                  ? chat.document
                  : null;

              return (
                <Link
                  key={chat._id}
                  to={`/chat/${chat._id}`}
                  className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 transition hover:border-indigo-300 hover:shadow-sm sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex min-w-0 items-start gap-4">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600">
                      <MessageSquare size={21} />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate font-semibold text-gray-900 group-hover:text-indigo-600">
                        {chat.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500">

                        <span className="flex items-center gap-1.5">
                          <FileText size={14} />

                          {document
                            ? document.fileName
                            : "All Documents"}
                        </span>

                        <span className="flex items-center gap-1.5">
                          <Clock size={14} />

                          {new Date(
                            chat.lastMessageAt
                          ).toLocaleString()}
                        </span>

                      </div>
                    </div>
                  </div>

                  <span className="text-sm font-medium text-indigo-600">
                    Open Chat →
                  </span>
                </Link>
              );
            })}
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}

export default ChatHistory;