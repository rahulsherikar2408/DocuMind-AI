import { useCallback, useEffect, useRef, useState } from "react";
import {
  Link,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

import { MessageSquare, Sparkles } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

import DashboardLayout from "../components/layout/DashboardLayout";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";

import { useCreateChat } from "../hooks/useCreateChat";
import { useChat } from "../hooks/useChat";
import { useChatMessages } from "../hooks/useChatMessages";
import { useSendMessage } from "../hooks/useSendMessage";
import { useCurrentSubscription } from "../hooks/useSubscription";
import { useToast } from "../hooks/useToast";

function ChatPage() {
  const { id } = useParams<{ id: string }>();

  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Document ID and suggested question passed from DocumentDetails or Document cards
  const locationState = location.state as {
    documentId?: string;
    suggestedQuestion?: string;
  } | null;

  const documentId = locationState?.documentId;
  const suggestedQuestion = locationState?.suggestedQuestion;

  // Prevent duplicate chat creation on /chat
  const creationStarted = useRef(false);

  // Prevent duplicate automatic question submissions
  const suggestedQuestionSent = useRef<string | null>(null);

  const [sendError, setSendError] = useState("");

  // Create a new chat
  const {
    mutateAsync: createChat,
    isPending: isCreatingChat,
  } = useCreateChat();

  // Fetch existing chat
  const {
    data: chat,
    isLoading: isChatLoading,
    isError: isChatError,
    error: chatError,
  } = useChat(id || "");

  // Fetch chat messages
  const {
    data: messages = [],
    isLoading: isMessagesLoading,
    isError: isMessagesError,
    error: messagesError,
  } = useChatMessages(id || "");

  const { data: subscription } = useCurrentSubscription();
  const selectedModel = subscription?.selectedModel;
  const toast = useToast();

  // Send a message
  const {
    mutateAsync: sendChatMessage,
    isPending: isSendingMessage,
  } = useSendMessage();

  // Automatically create a chat when visiting /chat
  useEffect(() => {
    if (id || creationStarted.current) return;

    creationStarted.current = true;

    const createNewChat = async () => {
      try {
        const newChat = await createChat(documentId ? { documentId } : {});
        navigate(`/chat/${newChat._id}`, {
          replace: true,
          state: suggestedQuestion ? { suggestedQuestion } : null,
        });
      } catch (error) {
        console.error("Failed to create chat:", error);
        creationStarted.current = false;
      }
    };

    createNewChat();
  }, [id, createChat, navigate, documentId, suggestedQuestion]);

  // If id was a documentId and backend redirected to the corresponding chat session
  useEffect(() => {
    if (chat && id && chat._id !== id) {
      navigate(`/chat/${chat._id}`, {
        replace: true,
        state: location.state,
      });
    }
  }, [chat, id, navigate, location.state]);

  // Send a message to the backend
  const handleSendMessage = useCallback(
    async (question: string) => {
      if (!id || !question.trim() || isSendingMessage) return;

      try {
        setSendError("");

        await sendChatMessage({
          chatId: id,
          payload: {
            content: question.trim(),
            model: selectedModel,
          },
        });

      } catch (error) {
        console.error("Failed to send message:", error);
        const msg =
          error instanceof Error
            ? error.message
            : "Failed to send message. Please try again.";
        setSendError(msg);
        toast.error(msg, "Message Failed");

        // Refresh messages in case the user message was saved before the error
        queryClient.invalidateQueries({
          queryKey: ["chatMessages", id],
        });
      }
    },
    [id, isSendingMessage, sendChatMessage, queryClient, selectedModel, toast]
  );

  // Automatically send a suggested question exactly once
  useEffect(() => {
    if (!id || !suggestedQuestion || !chat) return;

    // Prevent sending the same question more than once
    if (suggestedQuestionSent.current === id) return;

    suggestedQuestionSent.current = id;

    // Remove navigation state so refreshing does not submit again
    navigate(`/chat/${id}`, {
      replace: true,
      state: null,
    });

    void handleSendMessage(suggestedQuestion);

  }, [id, suggestedQuestion, chat, navigate, handleSendMessage]);

  // Auto-scroll to bottom of chat when new messages appear or thinking
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSendingMessage]);

  // Determine the chat document name
  const document =
    chat?.document && typeof chat.document === "object"
      ? chat.document
      : null;

  const documentName = document?.fileName || "All Documents";

  // Chat creation loading
  if (!id || isCreatingChat) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Creating your conversation...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Chat loading
  if (isChatLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] items-center justify-center">
          <div className="text-center">
            <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />

            <p className="text-sm text-gray-500 dark:text-slate-400">
              Loading your conversation...
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Chat not found or API error
  if (isChatError || !chat) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <MessageSquare className="mb-4 h-12 w-12 text-gray-400 dark:text-slate-600" />

          <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
            Conversation not found
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            {chatError instanceof Error
              ? chatError.message
              : "Unable to load this conversation."}
          </p>

          <Link
            to="/chat"
            className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-700"
          >
            Start New Chat
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100dvh-128px)] min-h-[460px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950 sm:h-[calc(100dvh-145px)] sm:min-h-[550px]">
        {/* Chat Header */}
        <ChatHeader documentName={documentName} />

        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6">
          <div className="mx-auto max-w-4xl space-y-5">
            {/* Welcome Message */}
            {!isMessagesLoading &&
              !isMessagesError &&
              messages.length === 0 && (
                <div className="flex min-h-[45vh] flex-col items-center justify-center text-center">
                  <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-indigo-100 dark:bg-indigo-950/70">
                    <Sparkles className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>

                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white">
                    {document
                      ? `Ask questions about ${document.fileName}`
                      : "How can I help you?"}
                  </h2>

                  <p className="mt-2 max-w-md text-sm text-gray-500 dark:text-slate-400">
                    {document
                      ? `Ask questions about ${document.fileName} and get AI-powered answers with relevant source references.`
                      : "Ask questions about your uploaded documents and get AI-powered answers with relevant source references."}
                  </p>
                </div>
              )}

            {/* Messages Loading */}
            {isMessagesLoading && (
              <div className="flex justify-center py-10">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
              </div>
            )}

            {/* Messages Error */}
            {isMessagesError && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {messagesError instanceof Error
                  ? messagesError.message
                  : "Unable to load messages."}
              </div>
            )}

            {/* Chat Messages */}
            {!isMessagesLoading &&
              !isMessagesError &&
              messages.map((message) => (
                <ChatMessage
                  key={message._id}
                  message={message}
                />
              ))}

            {/* Gemini Thinking Indicator */}
            {isSendingMessage && (
              <div className="my-5 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
                  <Sparkles className="h-5 w-5" />
                </div>

                <div className="rounded-xl bg-gray-100 px-4 py-3 dark:bg-slate-800/80">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 dark:bg-slate-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:150ms] dark:bg-slate-400" />
                    <span className="h-2 w-2 animate-bounce rounded-full bg-gray-500 [animation-delay:300ms] dark:bg-slate-400" />

                    <span className="ml-2 text-sm text-gray-500 dark:text-slate-400">
                      DocuMind AI is thinking...
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Sending Error */}
            {sendError && (
              <div className="my-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
                {sendError}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Chat Input */}
        <div className="border-t border-gray-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900 sm:px-6">
          <div className="mx-auto max-w-4xl">
            <ChatInput
              onSend={handleSendMessage}
              disabled={isSendingMessage}
            />

            <p className="mt-2 text-center text-xs text-gray-400 dark:text-slate-500">
              AI-generated responses may contain mistakes.
              Verify important information with your document.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

export default ChatPage;
