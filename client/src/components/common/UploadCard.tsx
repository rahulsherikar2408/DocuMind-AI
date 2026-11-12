import { useRef, useState, type ChangeEvent } from "react";
import { Upload, FileText, X, CheckCircle2 } from "lucide-react";

function UploadCard() {
  const inputRef = useRef<HTMLInputElement>(null);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    setError("");

    if (!file) return;

    if (file.type !== "application/pdf") {
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

    if (inputRef.current) {
      inputRef.current.value = "";
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-indigo-50 p-3 text-indigo-600">
          <Upload size={22} />
        </div>

        <div>
          <h3 className="font-semibold text-slate-900">Upload a Document</h3>

          <p className="text-xs text-slate-500">Add a PDF to your workspace</p>
        </div>
      </div>

      <div className="mt-6 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 p-6 text-center transition hover:border-indigo-300">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,applicatio/pdf"
          onChange={handleFileChange}
          className="hidden"
          id="document-upload"
        />

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-indigo-50 text-indigo-600">
          <FileText size={27} />
        </div>

        <p className="mt-4 text-sm font-semibold text-slate-800">
          Choose a PDF file
        </p>

        <p className="mt-2 text-xs text-slate-500">Maximum file size: 10 MB</p>

        <button
          onClick={() => inputRef.current?.click()}
          className="mt-5 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          Browse File
        </button>

        {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
      </div>

      {selectedFile && (
        <div className="mt-4 flex items-center gap-3 rounded-xl border border-green-200 bg-green-50 p-3">
          <CheckCircle2 size={20} className="text-green-600" />

          <div className="min-w-0 flex-1">
            <p className="truncate text-xm font-semibold text-slate-800">
              {selectedFile.name}
            </p>

            <p className="text-xs text-slate-500">
              {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
            </p>
          </div>

          <button
            onClick={removeFile}
            className="rounded-lg p-2 text-slate-500 hover:bg-white"
            aria-label="Remove selected file"
          >
            <X size={17} />
          </button>
        </div>
      )}

      <p className="mt-4 text-center text-xs text-slate-400">
        PDF files only. Your documents will be processed securely.
      </p>
    </div>
  );
}

export default UploadCard;
