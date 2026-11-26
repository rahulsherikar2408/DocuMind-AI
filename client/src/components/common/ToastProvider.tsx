import { useCallback, useMemo, useState, type ReactNode } from "react";
import {
  CheckCircle2,
  AlertCircle,
  Info,
  AlertTriangle,
  X,
} from "lucide-react";
import {
  ToastContext,
  type ToastItem,
  type ToastVariant,
} from "../../contexts/toastTypes";

interface ToastProviderProps {
  children: ReactNode;
}

const VARIANT_STYLES: Record<
  ToastVariant,
  {
    container: string;
    iconWrap: string;
    icon: typeof CheckCircle2;
    progress: string;
  }
> = {
  success: {
    container:
      "border-emerald-200/90 bg-white/95 text-slate-800 shadow-emerald-950/5 dark:border-emerald-800/70 dark:bg-slate-900/95 dark:text-slate-100",
    iconWrap:
      "bg-emerald-100 text-emerald-600 dark:bg-emerald-950/80 dark:text-emerald-400",
    icon: CheckCircle2,
    progress: "bg-emerald-500",
  },
  error: {
    container:
      "border-red-200/90 bg-white/95 text-slate-800 shadow-red-950/5 dark:border-red-900/70 dark:bg-slate-900/95 dark:text-slate-100",
    iconWrap: "bg-red-100 text-red-600 dark:bg-red-950/80 dark:text-red-400",
    icon: AlertCircle,
    progress: "bg-red-500",
  },
  info: {
    container:
      "border-indigo-200/90 bg-white/95 text-slate-800 shadow-indigo-950/5 dark:border-indigo-900/70 dark:bg-slate-900/95 dark:text-slate-100",
    iconWrap:
      "bg-indigo-100 text-indigo-600 dark:bg-indigo-950/80 dark:text-indigo-400",
    icon: Info,
    progress: "bg-indigo-500",
  },
  warning: {
    container:
      "border-amber-200/90 bg-white/95 text-slate-800 shadow-amber-950/5 dark:border-amber-900/70 dark:bg-slate-900/95 dark:text-slate-100",
    iconWrap:
      "bg-amber-100 text-amber-600 dark:bg-amber-950/80 dark:text-amber-400",
    icon: AlertTriangle,
    progress: "bg-amber-500",
  },
};

function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const showToast = useCallback(
    ({
      title,
      message,
      variant = "info",
      duration = 4200,
    }: {
      title?: string;
      message: string;
      variant?: ToastVariant;
      duration?: number;
    }) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      setToasts((prev) => [...prev.slice(-3), { id, title, message, variant, duration }]);

      if (duration > 0) {
        window.setTimeout(() => {
          dismissToast(id);
        }, duration);
      }
    },
    [dismissToast]
  );

  const success = useCallback(
    (message: string, title?: string) =>
      showToast({ title, message, variant: "success" }),
    [showToast]
  );

  const error = useCallback(
    (message: string, title?: string) =>
      showToast({ title, message, variant: "error", duration: 5200 }),
    [showToast]
  );

  const info = useCallback(
    (message: string, title?: string) =>
      showToast({ title, message, variant: "info" }),
    [showToast]
  );

  const warning = useCallback(
    (message: string, title?: string) =>
      showToast({ title, message, variant: "warning", duration: 4800 }),
    [showToast]
  );

  const contextValue = useMemo(
    () => ({
      showToast,
      success,
      error,
      info,
      warning,
      dismissToast,
    }),
    [showToast, success, error, info, warning, dismissToast]
  );

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Toast Viewport */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="pointer-events-none fixed bottom-4 left-4 right-4 z-[100] flex flex-col gap-2.5 sm:left-auto sm:right-6 sm:bottom-6 sm:w-96"
      >
        {toasts.map((toast) => {
          const style = VARIANT_STYLES[toast.variant];
          const Icon = style.icon;

          return (
            <div
              key={toast.id}
              role="status"
              className={`pointer-events-auto relative overflow-hidden rounded-2xl border p-4 shadow-xl backdrop-blur-md transition-all duration-300 animate-[toastSlideIn_0.25s_ease-out] ${style.container}`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${style.iconWrap}`}
                >
                  <Icon size={18} />
                </div>

                <div className="min-w-0 flex-1 pt-0.5">
                  {toast.title && (
                    <p className="text-xs font-bold uppercase tracking-wide text-slate-900 dark:text-white">
                      {toast.title}
                    </p>
                  )}
                  <p className="text-sm leading-5 text-slate-700 dark:text-slate-200">
                    {toast.message}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => dismissToast(toast.id)}
                  aria-label="Close notification"
                  className="rounded-lg p-1 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300 cursor-pointer"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export default ToastProvider;
