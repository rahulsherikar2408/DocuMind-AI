import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import { MessageSquare, Sparkles } from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessage from "../components/chat/ChatMessage";

import { useCreateChat } from "../hooks/useCreateChat";
import { useChat } from "../hooks/useChat";
import { useChatMessages } from "../hooks/useChatMessages";

function ChatPage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const location = useLocation();

  const documentId = (location.state as { documentId?: string } | null)
    ?.documentId;

  const creationStarted = useRef(false);
  const [creationError, setCreationError] = useState(false);

  const { mutateAsync: createChat, isPending: isCreatingChat } =
    useCreateChat();

  const {
    data: chat,
    isPending: isLoadingChat,
    isError: isChatError,
  } = useChat(id);

  const {
    data: messages = [],
    isPending: isLoadingMessages,
    isError: isMessagesError,
  } = useChatMessages(id);

  // Create a new chat.
  const startNewChat = useCallback(async () => {
    if (creationStarted.current) return;

    creationStarted.current = true;
    setCreationError(false);

    try {
      console.log("Document ID received:", documentId);

      const newChat = await createChat(documentId ? { documentId } : {});

      console.log("Created chat:", newChat);

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
                  Something went wrong while creating your conversation. Please
                  try again.
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

  const document =
    typeof chat.document === "object" && chat.document !== null
      ? chat.document
      : null;

  const documentName = document?.fileName || "All Documents";

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-145px)] min-h-[550px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        <ChatHeader documentName={documentName} />

        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {isLoadingMessages ? (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                <p className="mt-3 text-sm text-slate-500">
                  Loading messages...
                </p>
              </div>
            </div>
          ) : isMessagesError ? (
            <div className="rounded-lg border border-red-100 bg-red-50 p-4 text-center">
              <p className="text-sm text-red-600">
                Unable to load conversation messages.
              </p>
            </div>
          ) : messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-50">
                <Sparkles size={26} className="text-indigo-600" />
              </div>

              <h2 className="mt-4 text-lg font-semibold text-slate-800">
                Start your conversation
              </h2>

              <p className="mt-2 max-w-sm text-sm leading-6 text-slate-500">
                {document
                  ? `Ask questions about ${document.fileName}.`
                  : "Ask questions about your uploaded documents and explore their contents."}
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <ChatMessage key={message._id} message={message} />
            ))
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-4 sm:px-6">
          <p className="text-center text-xs text-slate-400">
            Message input will be connected to the backend in the next step.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ChatPage;
