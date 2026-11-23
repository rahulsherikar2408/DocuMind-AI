import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import {
  ArrowLeft,
  FileText,
  MessageSquare,
  Sparkles,
  Loader2,
  Lightbulb,
  RefreshCw,
  Download,
  ExternalLink,
} from "lucide-react";

import DashboardLayout from "../components/layout/DashboardLayout";
import DocumentInfo from "../components/documents/DocumentInfo";

import { useDocument } from "../hooks/useDocuments";
import { useCreateChat } from "../hooks/useCreateChat";
import { useGenerateSummary } from "../hooks/useGenerateSummary";
import { useSuggestedQuestions } from "../hooks/useSuggestedQuestions";
import type { Document as DisplayDocumentType } from "../types/document";

function DocumentDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [chatError, setChatError] = useState("");

  // Fetch document details
  const {
    data: document,
    isLoading,
    error,
  } = useDocument(id || "");

  // Create document-specific chat
  const {
    mutateAsync: createChat,
    isPending: isCreatingChat,
  } = useCreateChat();

  // Generate document summary
  const {
    mutateAsync: generateSummary,
    data: summaryData,
    isPending: isGenerating,
    error: summaryError,
  } = useGenerateSummary();

  // Fetch AI-suggested questions
  const {
    data: suggestedQuestionsData,
    isLoading: isLoadingQuestions,
    error: questionsError,
    refetch: refetchQuestions,
    isFetching: isFetchingQuestions,
  } = useSuggestedQuestions(
    document?.status === "completed" ? document._id : ""
  );

  const isDocumentCompleted = document?.status === "completed";

  // Create a chat associated with this document
  const handleChatWithDocument = async () => {
    if (!document?._id) return;

    try {
      setChatError("");

      const newChat = await createChat({
        documentId: document._id,
      });

      navigate(`/chat/${newChat._id}`);
    } catch (error) {
      console.error("Failed to create document chat:", error);

      setChatError(
        "Unable to start a chat with this document. Please try again."
      );
    }
  };

  // Generate document summary
  const handleGenerateSummary = async () => {
    if (!document?._id) return;

    try {
      await generateSummary(document._id);
    } catch (error) {
      console.error("Summary generation failed:", error);
    }
  };

  // Start a document-specific chat with a suggested question
  const handleSuggestedQuestion = async (question: string) => {
    if (!document?._id) return;

    try {
      setChatError("");

      const newChat = await createChat({
        documentId: document._id,
      });

      navigate(`/chat/${newChat._id}`, {
        state: {
          suggestedQuestion: question,
        },
      });
    } catch (error) {
      console.error(
        "Failed to start suggested question chat:",
        error
      );

      setChatError(
        "Unable to start a chat. Please try again."
      );
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-indigo-600 dark:text-indigo-400" />
        </div>
      </DashboardLayout>
    );
  }

  // Error or document not found
  if (error || !document) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] flex-col items-center justify-center text-center">
          <FileText className="mb-4 h-12 w-12 text-gray-400 dark:text-slate-600" />

          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Document Not Found
          </h2>

          <p className="mt-2 text-sm text-gray-500 dark:text-slate-400">
            The document could not be found or you don't have
            permission to access it.
          </p>

          <Link
            to="/documents"
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Documents
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  // Format document information for DocumentInfo component
  const displayDocument: DisplayDocumentType = {
    id: document._id,
    name: document.fileName,
    date: new Date(document.createdAt).toLocaleDateString(),
    size: `${(document.fileSize / (1024 * 1024)).toFixed(2)} MB`,
    pages: document.pageCount,
    status: document.status,
  };

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Back Navigation */}
        <Link
          to="/documents"
          className="inline-flex items-center gap-2 text-sm text-gray-500 transition hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Documents
        </Link>

        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Document Details
            </h1>

            <p className="mt-1 text-sm text-gray-500 dark:text-slate-400">
              View information and interact with your document.
            </p>
          </div>

          {/* Action Buttons */}
          {isDocumentCompleted && (
            <div className="flex flex-wrap gap-3">
              {/* Generate Summary */}
              <button
                onClick={handleGenerateSummary}
                disabled={isGenerating}
                className="inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating Summary...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate Summary
                  </>
                )}
              </button>

              {/* Chat with Document */}
              <button
                onClick={handleChatWithDocument}
                disabled={isCreatingChat}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 cursor-pointer"
              >
                {isCreatingChat ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Starting Chat...
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-4 w-4" />
                    Chat with Document
                  </>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Chat Error */}
        {chatError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/40 dark:text-red-400">
            {chatError}
          </div>
        )}

        {/* Document Information */}
        <DocumentInfo document={displayDocument} />

        {/* AI-Suggested Questions */}
        {isDocumentCompleted && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            {/* Section Header */}
            <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-50 dark:bg-amber-950/60">
                  <Lightbulb className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>

                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                    AI-Suggested Questions
                  </h2>

                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    Explore your document with these questions.
                  </p>
                </div>
              </div>

              {/* Refresh Questions */}
              <button
                onClick={() => refetchQuestions()}
                disabled={isFetchingQuestions}
                className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
              >
                <RefreshCw
                  className={`h-4 w-4 ${
                    isFetchingQuestions
                      ? "animate-spin"
                      : ""
                  }`}
                />
                Refresh Questions
              </button>
            </div>

            {/* Loading State */}
            {isLoadingQuestions && (
              <div className="flex items-center gap-3 py-6 text-sm text-gray-500 dark:text-slate-400">
                <Loader2 className="h-5 w-5 animate-spin text-indigo-600 dark:text-indigo-400" />
                Generating suggested questions...
              </div>
            )}

            {/* Error State */}
            {questionsError && !isLoadingQuestions && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4 dark:border-red-900/50 dark:bg-red-950/30">
                <p className="text-sm text-red-600 dark:text-red-400">
                  Unable to generate suggested questions.
                </p>

                <button
                  onClick={() => refetchQuestions()}
                  className="mt-2 text-sm font-medium text-red-700 underline dark:text-red-400"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Questions List */}
            {!isLoadingQuestions &&
              !questionsError &&
              suggestedQuestionsData?.questions && (
                <div className="space-y-3">
                  {suggestedQuestionsData.questions.map(
                    (question, index) => (
                      <button
                        key={`${index}-${question}`}
                        onClick={() =>
                          handleSuggestedQuestion(
                            question
                          )
                        }
                        disabled={isCreatingChat}
                        className="group flex w-full items-start gap-3 rounded-lg border border-gray-200 p-4 text-left transition hover:border-indigo-300 hover:bg-indigo-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-800 dark:hover:border-indigo-800 dark:hover:bg-indigo-950/30 cursor-pointer"
                      >
                        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700 dark:bg-indigo-950/80 dark:text-indigo-300">
                          {index + 1}
                        </span>

                        <span className="flex-1 text-sm leading-6 text-gray-700 group-hover:text-indigo-700 dark:text-slate-200 dark:group-hover:text-indigo-300">
                          {question}
                        </span>

                        <MessageSquare className="mt-1 h-4 w-4 shrink-0 text-gray-400 group-hover:text-indigo-600 dark:text-slate-500 dark:group-hover:text-indigo-400" />
                      </button>
                    )
                  )}
                </div>
              )}

            {/* Empty State */}
            {!isLoadingQuestions &&
              !questionsError &&
              suggestedQuestionsData?.questions?.length === 0 && (
                <p className="py-5 text-center text-sm text-gray-500 dark:text-slate-400">
                  No suggested questions are available.
                </p>
              )}
          </div>
        )}

        {/* Summary Error */}
        {summaryError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            {summaryError instanceof Error
              ? summaryError.message
              : "Failed to generate document summary. Please try again."}
          </div>
        )}

        {/* Generated Summary */}
        {summaryData?.summary && (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-50 dark:bg-indigo-950/60">
                <Sparkles className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>

              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  AI Document Summary
                </h2>

                <p className="text-sm text-gray-500 dark:text-slate-400">
                  Generated using Gemini AI
                </p>
              </div>
            </div>

            <div className="whitespace-pre-wrap text-sm leading-7 text-gray-700 dark:text-slate-200">
              {summaryData.summary}
            </div>

            <div className="mt-5 border-t border-gray-100 pt-4 dark:border-slate-800">
              <p className="text-xs text-gray-400 dark:text-slate-500">
                This summary is generated from the content of
                your uploaded document.
              </p>
            </div>
          </div>
        )}

        {/* Document Preview / Download */}
        <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xs dark:border-slate-800 dark:bg-slate-900">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 px-6 py-4 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="font-semibold text-gray-900 dark:text-white">
                Document Preview & Access
              </h2>
            </div>

            {document.storageUrl && (
              <div className="flex items-center gap-3">
                <a
                  href={document.storageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 transition hover:bg-gray-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <ExternalLink className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
                  Open in New Tab
                </a>

                <a
                  href={document.storageUrl}
                  download={document.fileName}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-indigo-700"
                >
                  <Download className="h-3.5 w-3.5" />
                  Download PDF
                </a>
              </div>
            )}
          </div>

          {document.storageUrl ? (
            <>
              <div className="relative w-full bg-slate-100 dark:bg-slate-950">
                <iframe
                  src={`${document.storageUrl}#toolbar=1`}
                  title={`Preview of ${document.fileName}`}
                  className="h-[650px] w-full border-0"
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-3.5 text-xs text-gray-500 dark:border-slate-800 dark:bg-slate-800/60 dark:text-slate-400">
                <span>
                  {displayDocument.size} · {document.pageCount} pages · Status: {document.status}
                </span>

                <div className="flex items-center gap-4">
                  <a
                    href={document.storageUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Open Fullscreen
                  </a>

                  <a
                    href={document.storageUrl}
                    download={document.fileName}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    <Download className="h-3.5 w-3.5" />
                    Download PDF
                  </a>
                </div>
              </div>
            </>
          ) : (
            <div className="flex min-h-[220px] flex-col items-center justify-center bg-gray-50 p-8 text-center dark:bg-slate-800/40">
              <FileText className="mb-4 h-16 w-16 text-indigo-300 dark:text-indigo-900" />

              <h3 className="text-base font-medium text-gray-800 dark:text-slate-200">
                {document.fileName}
              </h3>

              <p className="mt-1 text-xs text-gray-500 dark:text-slate-400">
                {displayDocument.size} · {document.pageCount} pages · Status: {document.status}
              </p>

              <p className="mt-3 text-sm text-gray-500 dark:text-slate-400">
                PDF file is being processed or preview is currently unavailable.
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}

export default DocumentDetails;
