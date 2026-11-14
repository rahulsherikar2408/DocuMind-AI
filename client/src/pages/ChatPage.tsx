import { useState } from "react";
import { Sparkles, MessageSquare } from "lucide-react";
import { Link, useParams } from "react-router-dom";

import DashboardLayout from "../components/layout/DashboardLayout";
import ChatHeader from "../components/chat/ChatHeader";
import ChatMessage from "../components/chat/ChatMessage";
import ChatInput from "../components/chat/ChatInput";

import type { Message } from "../components/chat/ChatMessage";
import type { Document } from "../types/document";

const sampleDocuments: Document[] = [
  {
    id: "1",
    name: "Software Engineering Report.pdf",
    date: "Nov 10, 2026",
    size: "2.4 MB",
    pages: 45,
    status: "Completed",
  },
  {
    id: "2",
    name: "Machine Learning Notes.pdf",
    date: "Nov 09, 2026",
    size: "1.8 MB",
    pages: 32,
    status: "Completed",
  },
  {
    id: "3",
    name: "Project Documentation.pdf",
    date: "Nov 09, 2026",
    size: "4.2 MB",
    pages: 86,
    status: "Processing",
  },
  {
    id: "4",
    name: "Database Management.pdf",
    date: "Nov 08, 2026",
    size: "1.2 MB",
    pages: 28,
    status: "Failed",
  },
  {
    id: "5",
    name: "React Development Guide.pdf",
    date: "Nov 07, 2026",
    size: "3.1 MB",
    pages: 64,
    status: "Completed",
  },
  {
    id: "6",
    name: "System Design Interview.pdf",
    date: "Nov 06, 2026",
    size: "2.7 MB",
    pages: 51,
    status: "Completed",
  },
];

const suggestions = [
  "Summarize this document",
  "What are the key concepts?",
  "Explain the important topics",
];

function ChatPage() {
  const { id } = useParams<{ id: string }>();

  const document = sampleDocuments.find((doc) => doc.id === id);

  const [message, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      role: "assistant",
      content: document
        ? `Hello I've opened "${document.name}". I'm your DocuMind AI assistant. You can ask questions about this document, request summaries, or explore important concepts.`
        : "Welcome to DocuMind AI!",
    },
  ]);

  const handleSendMessage = (question: string) => {
    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    const assistantMessage: Message = {
      id: crypto.randomUUID(),
      role: "assistant",
      content:
        "This is a sample AI response for the frontend demonstration. Once we integrate Gemini and the RAG pipeline, I'll search the relevant document sections and generate an answer based on their actual content.",
      sources: [
        {
          page: 12,
          excerpt:
            "This is a placeholder source reference. Actual references will come from the retrieved document chunks.",
        },
        {
          page: 12,
          excerpt:
            "The real AI response will include relevant text extracted from this page.",
        },
      ],
    };

    setMessages((currentMessages) => [
      ...currentMessages,
      userMessage,
      assistantMessage,
    ]);
  };

  if (!document) {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <MessageSquare size={40} className="mx-auto text-slate-300" />

          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Document not found
          </h2>

          <p className="mt-4 text-sm text-slate-500">
            The document associated with this conversation does not exist.
          </p>

          <Link
            to="/documents"
            className="mt-5 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            Back to Documents
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (document.status !== "Completed") {
    return (
      <DashboardLayout>
        <div className="rounded-xl border border-slate-200 bg-white p-10 text-center">
          <Sparkles size={40} className="mx-auto text-indigo-400" />

          <h2 className="mt-4 text-xl font-semibold text-slate-800">
            Document not ready
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            This document must finish processing before you can chat with it.
          </p>

          <Link
            to={`/documents/${document.id}`}
            className="mt-5 inline-flex text-sm font-medium text-indigo-600 hover:text-indigo-700"
          >
            View Document
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-145px)] min-h-[550px] flex-col overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
        {/* Chat Header */}
        <ChatHeader documentName={document.name} />

        {/* Messages */}
        <div className="flex-1 space-y-6 overflow-y-auto p-4 sm:p-6">
          {message.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </div>

        {/* Suggested Questions */}
      </div>
    </DashboardLayout>
  );
}

export default ChatPage;
