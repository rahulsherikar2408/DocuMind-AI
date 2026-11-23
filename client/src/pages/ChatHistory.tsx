import { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import {
  MessageSquare,
  FileText,
  Clock,
  Plus,
  LoaderCircle,
  AlertCircle,
  Trash2,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import { useChats } from "../hooks/useChats";
import { useDeleteChat } from "../hooks/useDeleteChat";
import type { Chat } from "../types/chat";

function ChatHistory() {
  const {
    data: chats = [],
    isLoading,
    isError,
    refetch,
  } = useChats();

  const {
    mutateAsync: deleteChatMutation,
    isPending: isDeleting,
  } = useDeleteChat();

  const [chatToDelete, setChatToDelete] = useState<Chat | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  // Close modal on escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && chatToDelete && !isDeleting) {
        setChatToDelete(null);
        setDeleteError(null);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [chatToDelete, isDeleting]);

  const handleDeleteConfirm = async () => {
    if (!chatToDelete) return;

    try {
      setDeleteError(null);
      await deleteChatMutation(chatToDelete._id);
      setChatToDelete(null);
    } catch (err: unknown) {
      console.error("Failed to delete chat:", err);
      setDeleteError(
        err instanceof Error
          ? err.message
          : "Failed to delete chat. Please try again."
      );
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Chat History
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              View and continue your previous conversations.
            </p>
          </div>

          <Link
            to="/chat"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition cursor-pointer"
          >
            <Plus size={18} />
            All Documents Chat
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-16">
            <LoaderCircle
              size={32}
              className="animate-spin text-indigo-600 dark:text-indigo-400"
            />

            <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
              Loading your conversations...
            </p>
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center dark:border-red-900/50 dark:bg-red-950/30">
            <AlertCircle
              size={32}
              className="mx-auto text-red-500 dark:text-red-400"
            />

            <p className="mt-3 font-medium text-red-700 dark:text-red-400">
              Unable to load chat history.
            </p>

            <button
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-red-600 px-4 py-2 text-sm text-white hover:bg-red-700 cursor-pointer"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!isLoading && !isError && chats.length === 0 && (
          <div className="rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center dark:border-slate-800 dark:bg-slate-900">
            <MessageSquare
              size={42}
              className="mx-auto text-gray-400 dark:text-slate-600"
            />

            <h2 className="mt-4 text-lg font-semibold text-gray-900 dark:text-white">
              No conversations yet
            </h2>

            <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
              Start a conversation with your uploaded documents.
            </p>

            <Link
              to="/chat"
              className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 cursor-pointer"
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
                <div
                  key={chat._id}
                  className="group flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-xs transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900 dark:hover:border-indigo-700 dark:hover:shadow-none sm:flex-row sm:items-center sm:justify-between"
                >
                  <Link
                    to={`/chat/${chat._id}`}
                    className="flex min-w-0 flex-1 items-start gap-4"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-indigo-50 text-indigo-600 transition group-hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400 dark:group-hover:bg-indigo-900/60">
                      <MessageSquare size={21} />
                    </div>

                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-semibold text-gray-900 transition group-hover:text-indigo-600 dark:text-white dark:group-hover:text-indigo-400">
                        {chat.title}
                      </h3>

                      <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-500 dark:text-slate-400">
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
                  </Link>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-gray-100 dark:border-slate-800">
                    <Link
                      to={`/chat/${chat._id}`}
                      className="text-sm font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 transition"
                    >
                      Open Chat →
                    </Link>

                    <button
                      type="button"
                      title="Delete chat"
                      aria-label={`Delete chat ${chat.title}`}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setDeleteError(null);
                        setChatToDelete(chat);
                      }}
                      className="rounded-lg p-2 text-gray-400 hover:bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:bg-red-950/50 dark:hover:text-red-400 transition cursor-pointer"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {chatToDelete && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs dark:bg-slate-950/80"
          onClick={() => {
            if (!isDeleting) {
              setChatToDelete(null);
              setDeleteError(null);
            }
          }}
        >
          <div
            className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400">
              <Trash2 size={24} />
            </div>

            <div className="mt-4 text-center">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                Delete Conversation
              </h3>
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
                Are you sure you want to delete{" "}
                <span className="font-semibold text-gray-900 dark:text-white">
                  "{chatToDelete.title}"
                </span>
                ? This action cannot be undone and will delete all messages in this conversation.
              </p>
            </div>

            {deleteError && (
              <div className="mt-4 rounded-lg bg-red-50 p-3 text-center text-sm text-red-700 dark:border dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => {
                  setChatToDelete(null);
                  setDeleteError(null);
                }}
                className="flex-1 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDeleteConfirm}
                className="flex-1 inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50 transition cursor-pointer"
              >
                {isDeleting && (
                  <LoaderCircle size={16} className="animate-spin" />
                )}
                {isDeleting ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

export default ChatHistory;
