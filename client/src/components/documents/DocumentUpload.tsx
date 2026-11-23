import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";

import {
  FileText,
  UploadCloud,
  X,
  CheckCircle,
  LoaderCircle,
} from "lucide-react";

interface DocumentUploadProps {
  onClose: () => void;
  onUpload: (file: File) => Promise<void>;
  isUploading: boolean;
}

function DocumentUpload({
  onClose,
  onUpload,
  isUploading,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [isDragging, setIsDragging] = useState(false);

  // Validate selected PDF
  const validateFile = (file: File) => {
    const isPdf =
      file.type === "application/pdf" ||
      file.name.toLowerCase().endsWith(".pdf");

    if (!isPdf || !file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setError("Only PDF files are allowed.");
      return;
    }

    if (file.size === 0) {
      setSelectedFile(null);
      setError("The selected file is empty.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setSelectedFile(null);
      setError("File size must not exceed 10 MB.");
      return;
    }

    setError("");
    setSelectedFile(file);
  };

  // Handle file selection
  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      validateFile(file);
    }

    event.target.value = "";
  };

  // Handle drag and drop
  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);

    if (isUploading) return;

    const file = event.dataTransfer.files?.[0];

    if (file) {
      validateFile(file);
    }
  };

  const handleDragOver = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();

    if (!isUploading) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
  };

  // Upload selected PDF
  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setError("");

    try {
      await onUpload(selectedFile);
    } catch (err) {
      const apiError = err as {
        response?: {
          data?: {
            message?: string;
          };
        };
      };

      setError(
        apiError.response?.data?.message ||
          (err instanceof Error
            ? err.message
            : "Unable to upload document. Please try again."),
      );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs dark:bg-slate-950/80">
      <div className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800 dark:text-white">
              Upload Document
            </h2>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select a PDF to get started.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
            aria-label="Close upload dialog"
          >
            <X size={20} />
          </button>
        </div>

        {/* Drag and Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mt-6 rounded-xl border-2 border-dashed p-8 text-center transition ${
            isDragging
              ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
              : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
            <UploadCloud size={28} />
          </div>

          <p className="mt-4 font-medium text-slate-700 dark:text-slate-200">
            Drag and drop your PDF here
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">or</p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-3 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Browse Files
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            onChange={handleFileChange}
            disabled={isUploading}
            className="hidden"
          />

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            PDF files only · Maximum size 10 MB
          </p>
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3 dark:border-emerald-800/60 dark:bg-emerald-950/40">
            <FileText className="shrink-0 text-emerald-600 dark:text-emerald-400" size={24} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <CheckCircle className="shrink-0 text-emerald-600 dark:text-emerald-400" size={20} />
          </div>
        )}

        {/* Error Message */}
        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
          >
            Close
          </button>

          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <UploadCloud size={17} />
                Upload Document
              </>
            )}
          </button>
        </div>

        <p className="mt-3 text-center text-xs text-slate-400 dark:text-slate-500">
          Your PDF will be securely uploaded and saved.
        </p>
      </div>
    </div>
  );
}

export default DocumentUpload;
