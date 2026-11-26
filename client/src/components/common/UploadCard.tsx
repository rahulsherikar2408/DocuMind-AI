import { useRef, useState, type ChangeEvent } from "react";
import { Link } from "react-router-dom";
import {
  Upload,
  FileText,
  X,
  CheckCircle2,
  Loader2,
  UploadCloud,
  Crown,
  ScanText,
} from "lucide-react";
import { useUploadDocument } from "../../hooks/useUploadDocument";
import { useCurrentSubscription } from "../../hooks/useSubscription";
import { useToast } from "../../hooks/useToast";

const IMAGE_MIME_TYPES = new Set(["image/png", "image/jpeg", "image/webp"]);
const IMAGE_EXTENSIONS = [".png", ".jpg", ".jpeg", ".webp"];

function UploadCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();
  const { data: subscription } = useCurrentSubscription();
  const toast = useToast();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [useOcr, setUseOcr] = useState(false);
  const [error, setError] = useState("");
  const [showUpgradeLink, setShowUpgradeLink] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);

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

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setError("");
    setShowUpgradeLink(false);
    setUploadSuccess(false);

    if (!file) return;

    const lowerName = file.name.toLowerCase();
    const isPdf = file.type === "application/pdf" || lowerName.endsWith(".pdf");
    const isImg = isImageFile(file);

    if (!isPdf && !isImg) {
      setError(
        allowScannedOcr
          ? "Please select a PDF or scanned image (PNG, JPG, WEBP)."
          : "Please select a PDF file."
      );
      return;
    }

    if (isImg && !allowScannedOcr) {
      setError(
        "Scanned image uploads and OCR are only available on Plus and Pro plans."
      );
      setShowUpgradeLink(true);
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    setSelectedFile(file);
    if (isImg) {
      setUseOcr(true);
    }
  };

  const removeFile = () => {
    setSelectedFile(null);
    setUseOcr(false);
    setError("");
    setShowUpgradeLink(false);
    setUploadSuccess(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploadMutation.isPending || isDailyLimitReached) return;

    try {
      setError("");
      setShowUpgradeLink(false);
      const uploaded = await uploadMutation.mutateAsync({
        file: selectedFile,
        ocr: allowScannedOcr ? useOcr : false,
      });
      setUploadSuccess(true);
      toast.success(
        uploaded.extractionMethod === "ocr"
          ? `"${uploaded.fileName}" uploaded and OCR processed!`
          : `"${uploaded.fileName}" uploaded successfully!`,
        "Upload Complete"
      );
      setSelectedFile(null);
      setUseOcr(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
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

      if (
        apiError.response?.status === 403 ||
        apiError.response?.data?.code === "DAILY_LIMIT_REACHED" ||
        apiError.response?.data?.code === "OCR_PLAN_REQUIRED"
      ) {
        setShowUpgradeLink(true);
      }

      const msg =
        apiError.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Failed to upload document. Please try again.");
      setError(msg);
      toast.error(msg, "Upload Failed");
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
            <Upload size={22} />
          </div>

          <div>
            <h3 className="font-semibold text-slate-900 dark:text-white">
              Upload a Document
            </h3>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              {allowScannedOcr
                ? "Add a PDF or scanned document (OCR enabled)"
                : "Add a text-based PDF to your workspace"}
            </p>
          </div>
        </div>

        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300">
          {dailyUploadLimit === null
            ? `${planName} · Unlimited`
            : `${planName} · ${todayUploadsCount}/${dailyUploadLimit} today`}
        </span>
      </div>

      <div className="mt-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-500">
        <input
          ref={inputRef}
          type="file"
          accept={
            allowScannedOcr
              ? ".pdf,application/pdf,image/png,image/jpeg,image/webp"
              : ".pdf,application/pdf"
          }
          onChange={handleFileChange}
          disabled={isDailyLimitReached}
          className="hidden"
          id="document-upload"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
          <FileText size={27} />
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
          {allowScannedOcr
            ? "Choose a PDF or scanned image"
            : "Choose a text-based PDF file"}
        </p>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">
          Maximum file size: 10 MB
        </p>

        <button
          type="button"
          disabled={isDailyLimitReached}
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
        >
          Browse File
        </button>

        {isDailyLimitReached && (
          <p className="mt-3 text-xs font-medium text-amber-600 dark:text-amber-400">
            Daily limit reached ({dailyUploadLimit}/{dailyUploadLimit}).{" "}
            <Link to="/settings#subscription" className="underline">
              Upgrade Plan
            </Link>
          </p>
        )}

        {error && (
          <div className="mt-3 text-sm text-red-600 dark:text-red-400">
            <p>{error}</p>
            {showUpgradeLink && (
              <Link
                to="/settings#subscription"
                className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 underline dark:text-indigo-400"
              >
                <Crown size={12} />
                Upgrade in Settings
              </Link>
            )}
          </div>
        )}
        {uploadSuccess && (
          <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Document uploaded and processed successfully!
          </p>
        )}
      </div>

      {selectedFile && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <CheckCircle2
              size={20}
              className="shrink-0 text-emerald-600 dark:text-emerald-400"
            />

            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">
                {selectedFile.name}
              </p>

              <p className="text-xs text-slate-500 dark:text-slate-400">
                {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
              </p>
            </div>

            <button
              onClick={removeFile}
              disabled={uploadMutation.isPending}
              className="rounded-lg p-2 text-slate-500 hover:bg-white dark:text-slate-400 dark:hover:bg-slate-800 cursor-pointer"
              aria-label="Remove selected file"
            >
              <X size={17} />
            </button>
          </div>

          {allowScannedOcr && !isImageFile(selectedFile) && (
            <label className="flex cursor-pointer items-center justify-between rounded-lg bg-white/70 px-3 py-2 text-xs dark:bg-slate-900/60">
              <span className="flex items-center gap-1.5 font-medium text-slate-700 dark:text-slate-300">
                <ScanText size={14} className="text-indigo-600 dark:text-indigo-400" />
                Force OCR mode
              </span>
              <input
                type="checkbox"
                checked={useOcr}
                onChange={(e) => setUseOcr(e.target.checked)}
                disabled={uploadMutation.isPending}
                className="h-4 w-4 accent-indigo-600"
              />
            </label>
          )}

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                {useOcr ? "Running OCR & Uploading..." : "Uploading & Processing..."}
              </>
            ) : (
              <>
                <UploadCloud size={16} />
                Upload Now
              </>
            )}
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-400 dark:text-slate-500">
        {allowScannedOcr
          ? "PDF & scanned image OCR supported. Your documents are processed securely."
          : "Text-based PDF files only. Upgrade to Plus or Pro for scanned document OCR."}
      </p>
    </div>
  );
}

export default UploadCard;
