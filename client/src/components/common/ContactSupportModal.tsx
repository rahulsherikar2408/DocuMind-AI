import { useEffect, useState, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  X,
  HelpCircle,
  Send,
  Copy,
  Check,
  Mail,
  LoaderCircle,
} from "lucide-react";
import {
  createSupportTicket,
  type SupportCategory,
} from "../../services/supportService";
import { useToast } from "../../hooks/useToast";

interface ContactSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUPPORT_EMAIL = "sherikarrahul59@gmail.com";

function ContactSupportModal({ isOpen, onClose }: ContactSupportModalProps) {
  const toast = useToast();
  const queryClient = useQueryClient();

  const [category, setCategory] = useState<SupportCategory>("general");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && isOpen && !submitting) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, submitting, onClose]);

  if (!isOpen) return null;

  const handleCopyEmail = async () => {
    try {
      await navigator.clipboard.writeText(SUPPORT_EMAIL);
      setCopied(true);
      toast.success("Support email copied to clipboard!");
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Unable to copy email. Please copy it manually.");
    }
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (submitting) return;

    const trimmedSubject = subject.trim();
    const trimmedMessage = message.trim();

    if (!trimmedSubject) {
      setError("Please enter a subject.");
      return;
    }

    if (trimmedMessage.length < 10) {
      setError("Please describe your issue in at least 10 characters.");
      return;
    }

    try {
      setError("");
      setSubmitting(true);
      const response = await createSupportTicket({
        category,
        subject: trimmedSubject,
        message: trimmedMessage,
      });

      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(
        response.message || "Support request submitted successfully!",
        "Support Sent"
      );

      setCategory("general");
      setSubject("");
      setMessage("");
      onClose();
    } catch (err) {
      const apiErr = err as { response?: { data?: { message?: string } } };
      const msg =
        apiErr.response?.data?.message ||
        (err instanceof Error
          ? err.message
          : "Unable to submit support request.");
      setError(msg);
      toast.error(msg, "Support Error");
    } finally {
      setSubmitting(false);
    }
  };

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-xs dark:bg-slate-950/80"
      onClick={() => {
        if (!submitting) onClose();
      }}
    >
      <div
        className="w-full max-w-lg rounded-2xl border border-slate-200 bg-white p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <HelpCircle size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Contact Support
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Send us a message or reach us directly via email.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            aria-label="Close support dialog"
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50 dark:text-slate-500 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
          >
            <X size={20} />
          </button>
        </div>

        {/* Direct Email Bar */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-100 bg-slate-50 px-3.5 py-2.5 text-xs dark:border-slate-800 dark:bg-slate-800/50">
          <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200">
            <Mail size={14} className="text-indigo-600 dark:text-indigo-400" />
            <span className="font-medium">{SUPPORT_EMAIL}</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyEmail}
              className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-[11px] font-semibold text-slate-700 transition hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 cursor-pointer"
            >
              {copied ? <Check size={12} className="text-emerald-600" /> : <Copy size={12} />}
              {copied ? "Copied" : "Copy"}
            </button>

            <a
              href={`mailto:${SUPPORT_EMAIL}?subject=${encodeURIComponent("DocuMind AI Support")}`}
              className="inline-flex items-center gap-1 rounded-lg bg-indigo-50 px-2.5 py-1 text-[11px] font-semibold text-indigo-600 transition hover:bg-indigo-100 dark:bg-indigo-950/60 dark:text-indigo-400"
            >
              Open Mail App
            </a>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label
              htmlFor="support-category"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Category
            </label>
            <select
              id="support-category"
              value={category}
              disabled={submitting}
              onChange={(e) => setCategory(e.target.value as SupportCategory)}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
            >
              <option value="general">General Inquiry</option>
              <option value="billing">Billing & Subscription</option>
              <option value="ocr">Scanned Documents & OCR</option>
              <option value="technical">Technical Issue</option>
              <option value="other">Other</option>
            </select>
          </div>

          <div>
            <label
              htmlFor="support-subject"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Subject
            </label>
            <input
              id="support-subject"
              type="text"
              value={subject}
              disabled={submitting}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Briefly describe your question or issue..."
              maxLength={150}
              className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          <div>
            <label
              htmlFor="support-message"
              className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400"
            >
              Message
            </label>
            <textarea
              id="support-message"
              rows={4}
              value={message}
              disabled={submitting}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Share details so we can help you faster..."
              maxLength={2000}
              className="mt-1.5 w-full resize-y rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-indigo-500 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-600 dark:border-red-900/50 dark:bg-red-950/30 dark:text-red-400">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-800 cursor-pointer"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
            >
              {submitting ? (
                <>
                  <LoaderCircle size={16} className="animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Send size={16} />
                  Send Message
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>,
    document.body
  );
}

export default ContactSupportModal;
