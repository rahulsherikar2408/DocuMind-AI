import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { MessageSquare, Sparkles } from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import ChatHeader from "../components/chat/ChatHeader";

import { useCreateChat } from "../hooks/useCreateChat";
import { useChat } from "../hooks/useChat";

function ChatPage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const location = useLocation();

  // Optional document ID passed through navigation state.
  const documentId = (
    location.state as { documentId?: string } | null
  )?.documentId;

  const creationStarted = useRef(false);

  const [creationError, setCreationError] = useState(false);

  const {
    mutateAsync: createChat,
    isPending: isCreatingChat,
  } = useCreateChat();

  const {
    data: chat,
    isPending: isLoadingChat,
    isError: isChatError,
  } = useChat(id);

  // Create a new chat.
  const startNewChat = useCallback(async () => {
    if (creationStarted.current) return;

    creationStarted.current = true;
    setCreationError(false);

    try {
      const newChat = await createChat(
        documentId ? { documentId } : {}
      );

      navigate(`/chat/${newChat._id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Create chat error:", error);

      creationStarted.current = false;
      setCreationError(true);
    }
  }, [createChat, documentId, navigate]);

  // Automatically create a chat when visiting /chat.
  useEffect(() => {
    if (id) {
      creationStarted.current = false;
      return;
    }

    void startNewChat();
  }, [id, startNewChat]);

  // New chat creation screen.
  if (!id) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="max-w-md text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <Sparkles size={30} className="text-indigo-600" />
            </div>

            {creationError ? (
              <>
                <h2 className="mt-5 text-xl font-semibold text-slate-800">
                  Unable to create chat
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Something went wrong while creating your conversation.
                  Please try again.
                </p>

                <button
                  onClick={() => void startNewChat()}
                  disabled={isCreatingChat}
                  className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50"
                >
                  Try Again
                </button>
              </>
            ) : (
              <>
                <h2 className="mt-5 text-xl font-semibold text-slate-800">
                  Creating your conversation...
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  Please wait while we set up your new chat.
                </p>

                <div className="mx-auto mt-5 h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
              </>
            )}

          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Existing chat loading state.
  if (isLoadingChat) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[65vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
            <p className="mt-4 text-sm text-slate-500">
              Loading your conversation...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Existing chat error state.
  if (isChatError || !chat) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <MessageSquare size={40} className="mx-auto text-slate-300" />

          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Conversation not found
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This conversation does not exist or you do not have access to it.
          </p>

          <Link
            to="/chat-history"
            className="mt-5 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Back to Chat History
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // A chat can be associated with a document or all documents.
  const document =
    typeof chat.document === "object" && chat.document !== null
      ? chat.document
      : null;

  const documentName = document?.fileName || "All Documents";

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-145px)] min-h-[550px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">

        <ChatHeader documentName={documentName} />

        <div className="flex flex-1 items-center justify-center p-6">
          <div className="max-w-lg text-center">

            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-50">
              <Sparkles size={30} className="text-indigo-600" />
            </div>

            <h2 className="mt-5 text-xl font-semibold text-slate-800">
              Your conversation is ready!
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {document
                ? `You can now ask questions about ${document.fileName}.`
                : "Ask questions across your uploaded documents and let DocuMind AI find the relevant information."}
            </p>

            <p className="mt-4 text-xs text-slate-400">
              Chat ID: {chat._id}
            </p>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}

export default ChatPage;