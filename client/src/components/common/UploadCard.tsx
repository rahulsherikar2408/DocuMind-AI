import { useRef, useState, type ChangeEvent } from "react";
import { Upload, FileText, X, CheckCircle2, Loader2, UploadCloud } from "lucide-react";
import { useUploadDocument } from "../../hooks/useUploadDocument";

function UploadCard() {
  const inputRef = useRef<HTMLInputElement>(null);
  const uploadMutation = useUploadDocument();

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setError("");
    setUploadSuccess(false);

    if (!file) return;

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setError("Please select a PDF file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      return;
    }

    setSelectedFile(file);
  };

  const removeFile = () => {
    setSelectedFile(null);
    setError("");
    setUploadSuccess(false);

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  const handleUpload = async () => {
    if (!selectedFile || uploadMutation.isPending) return;

    try {
      setError("");
      await uploadMutation.mutateAsync(selectedFile);
      setUploadSuccess(true);
      setSelectedFile(null);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to upload document. Please try again."
      );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
          <Upload size={22} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 dark:text-white">Upload a Document</h3>

          <p className="text-xs text-slate-500 dark:text-slate-400">Add a PDF to your workspace</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-indigo-300 dark:border-slate-700 dark:bg-slate-800/50 dark:hover:border-indigo-500">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="document-upload"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600 dark:bg-indigo-950/70 dark:text-indigo-400">
          <FileText size={27} />
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-800 dark:text-slate-200">
          Choose a PDF file
        </p>

        <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">Maximum file size: 10 MB</p>

        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 cursor-pointer"
        >
          Browse File
        </button>

        {error && <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p>}
        {uploadSuccess && (
          <p className="mt-3 text-sm font-medium text-emerald-600 dark:text-emerald-400">
            Document uploaded and processed successfully!
          </p>
        )}
      </div>

      {selectedFile && (
        <div className="mt-4 flex flex-col gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-800/60 dark:bg-emerald-950/40">
          <div className="flex items-center gap-3">
            <CheckCircle2 size={20} className="shrink-0 text-emerald-600 dark:text-emerald-400" />

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

          <button
            type="button"
            onClick={handleUpload}
            disabled={uploadMutation.isPending}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 size={16} className="animate-spin" />
                Uploading & Processing...
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
        PDF files only. Your documents will be processed securely.
      </p>
    </div>
  );
}

export default UploadCard;
