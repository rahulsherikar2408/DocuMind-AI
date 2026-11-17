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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
      <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-800">
              Upload Document
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select a PDF to get started.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
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
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-300 bg-slate-50"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100">
            <UploadCloud size={28} className="text-indigo-600" />
          </div>

          <p className="mt-4 font-medium text-slate-700">
            Drag and drop your PDF here
          </p>

          <p className="mt-1 text-sm text-slate-500">or</p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="mt-3 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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

          <p className="mt-4 text-xs text-slate-400">
            PDF files only · Maximum size 10 MB
          </p>
        </div>

        {/* Selected File */}
        {selectedFile && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-emerald-200 bg-emerald-50 p-3">
            <FileText className="shrink-0 text-emerald-600" size={24} />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-800">
                {selectedFile.name}
              </p>

              <p className="text-xs text-slate-500">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <CheckCircle className="shrink-0 text-emerald-600" size={20} />
          </div>
        )}

        {/* Error Message */}
        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

        {/* Footer Buttons */}
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isUploading}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>

          <button
            type="button"
            disabled={!selectedFile || isUploading}
            onClick={handleUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
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

        <p className="mt-3 text-center text-xs text-slate-400">
          Your PDF will be securely uploaded and saved.
        </p>
      </div>
    </div>
  );
}

export default DocumentUpload;
