import { useRef, useState } from "react";
import type { ChangeEvent, DragEvent } from "react";
import { Link } from "react-router-dom";

import {
  FileText,
  UploadCloud,
  X,
  CheckCircle,
  LoaderCircle,
  ScanText,
  Crown,
} from "lucide-react";
import { useCurrentSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";

interface DocumentUploadProps {
  onClose: () => void;
  onUpload: (file: File, options?: { ocr?: boolean }) => Promise<void>;
  isUploading: boolean;
}

const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

function DocumentUpload({
  onClose,
  onUpload,
  isUploading,
}: DocumentUploadProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: subscription } = useCurrentSubscription();
  const toast = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useOcr, setUseOcr] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeLink, setShowUpgradeLink] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const allowScannedOcr = subscription?.usage?.allowScannedOcr ?? true;
  const planName = subscription?.planDetails?.name || "Free";
  const todayUploadsCount = subscription?.usage?.todayUploadsCount ?? 0;
  const dailyUploadLimit =
    subscription?.usage !== undefined
      ? subscription.usage.dailyUploadLimit
      : subscription?.plan === "pro"
        ? null
        : subscription?.plan === "plus"
          ? 10
          : 2;
  const isDailyLimitReached =
    Boolean(subscription) &&
    dailyUploadLimit !== null &&
    todayUploadsCount >= dailyUploadLimit;

  const isImageFile = (file: File) => {
    const lowerName = file.name.toLowerCase();
    return (
      IMAGE_MIME_TYPES.has(file.type) ||
      IMAGE_EXTENSIONS.some((ext) => lowerName.endsWith(ext))
    );
  };

  // Validate selected file
  const validateFile = (file: File) => {
    setShowUpgradeLink(false);

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isImg = isImageFile(file);

    if (!isPdf && !isImg) {
      setSelectedFile(null);
      setError(
        allowScannedOcr
          ? "Only PDF or scanned image files (PNG, JPG, WEBP) are allowed."
          : "Only PDF files are allowed."
      );
      return;
    }

    if (isImg && !allowScannedOcr) {
      setSelectedFile(null);
      setError(
        "Scanned image uploads and OCR are only available on Plus and Pro plans."
      );
      setShowUpgradeLink(true);
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
    if (isImg) {
      setUseOcr(true);
    }
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

  // Upload selected document
  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;

    setError("");
    setShowUpgradeLink(false);

    try {
      await onUpload(selectedFile, {
        ocr: allowScannedOcr ? useOcr : false,
      });
    } catch (err) {
      const apiError = err as {
        response?: {
          status?: number;
          data?: {
            code?: string;
            message?: string;
          };
        };
      };

      const errCode = apiError.response?.data?.code;
      if (
        errCode === "DAILY_LIMIT_REACHED" ||
        errCode === "OCR_PLAN_REQUIRED" ||
        apiError.response?.status === 403
      ) {
        setShowUpgradeLink(true);
      }

      const msg =
        apiError.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Unable to upload document. Please try again.");
      setError(msg);
      toast.error(msg, "Upload Failed");
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
              {allowScannedOcr
                ? "Select a PDF or scanned image (OCR enabled)."
                : "Select a text-based PDF to get started."}
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

        {/* Plan usage banner */}
        <div className="mt-4 flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50">
          <span className="font-medium text-slate-600 dark:text-slate-300">
            {planName} Plan ·{" "}
            {dailyUploadLimit === null
              ? `${todayUploadsCount} uploaded today (Unlimited)`
              : `${todayUploadsCount}/${dailyUploadLimit} daily uploads used`}
          </span>

          {dailyUploadLimit !== null && (
            <Link
              to="/settings#subscription"
              onClick={onClose}
              className="inline-flex items-center gap-1 font-semibold text-indigo-600 hover:underline dark:text-indigo-400"
            >
              <Crown size={12} />
              Upgrade
            </Link>
          )}
        </div>

        {isDailyLimitReached && (
          <div className="mt-3 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-900/50 dark:bg-amber-950/40 dark:text-amber-300">
            You have reached your daily limit of {dailyUploadLimit} documents on the{" "}
            {planName} plan.{" "}
            <Link
              to="/settings#subscription"
              onClick={onClose}
              className="font-semibold underline"
            >
              Upgrade your plan
            </Link>{" "}
            to upload more documents today.
          </div>
        )}

        {/* Drag and Drop Area */}
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          className={`mt-5 rounded-xl border-2 border-dashed p-7 text-center transition ${
            isDragging
              ? "border-indigo-500 bg-indigo-50 dark:border-indigo-400 dark:bg-indigo-950/40"
              : "border-slate-300 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/40"
          }`}
        >
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-100 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
            <UploadCloud size={28} />
          </div>

          <p className="mt-4 font-medium text-slate-700 dark:text-slate-200">
            {allowScannedOcr
              ? "Drag and drop your PDF or scanned image here"
              : "Drag and drop your PDF here"}
          </p>

          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">or</p>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading || isDailyLimitReached}
            className="mt-3 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            Browse Files
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept={
              allowScannedOcr
                ? ".pdf,application/pdf,image/png,image/jpeg,image/webp"
                : ".pdf,application/pdf"
            }
            onChange={handleFileChange}
            disabled={isUploading || isDailyLimitReached}
            className="hidden"
          />

          <p className="mt-4 text-xs text-slate-400 dark:text-slate-500">
            {allowScannedOcr
              ? "PDF, PNG, JPG, WEBP · OCR supported · Max 10 MB"
              : "Text-based PDFs only · Max 10 MB (OCR requires Plus/Pro)"}
          </p>
        </div>

        {/* OCR Toggle for Plus/Pro */}
        {allowScannedOcr && selectedFile && !isImageFile(selectedFile) && (
          <label className="mt-4 flex cursor-pointer items-center justify-between rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 dark:border-indigo-900/50 dark:bg-indigo-950/30">
            <div className="flex items-center gap-2.5">
              <ScanText size={18} className="text-indigo-600 dark:text-indigo-400" />
              <div>
                <p className="text-xs font-semibold text-slate-800 dark:text-slate-200">
                  Force Scanned Document OCR
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Scanned PDFs are detected automatically; enable to force Gemini OCR.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={useOcr}
              onChange={(e) => setUseOcr(e.target.checked)}
              disabled={isUploading}
              className="h-4 w-4 accent-indigo-600"
            />
          </label>
        )}

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
        {error && (
          <div className="mt-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
            <p>{error}</p>
            {showUpgradeLink && (
              <Link
                to="/settings#subscription"
                onClick={onClose}
                className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 underline dark:text-indigo-400"
              >
                <Crown size={12} />
                View Plans & Upgrade in Settings
              </Link>
            )}
          </div>
        )}

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
            disabled={!selectedFile || isUploading || isDailyLimitReached}
            onClick={handleUpload}
            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {isUploading ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                {useOcr ? "Running OCR & Uploading..." : "Uploading..."}
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
          Your document will be securely uploaded and processed.
        </p>
      </div>
    </div>
  );
}

export default DocumentUpload;
