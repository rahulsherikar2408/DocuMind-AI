import { createContext } from "react";

export const PENDING_TOAST_KEY = "documind_pending_toast";
export const AUTH_STATE_KEY = "documind_auth_state";

export type ToastVariant = "success" | "error" | "info" | "warning";

export interface ToastItem {
  id: string;
  title?: string;
  message: string;
  variant: ToastVariant;
  duration?: number;
}

export interface ToastContextValue {
  showToast: (options: {
    title?: string;
    message: string;
    variant?: ToastVariant;
    duration?: number;
  }) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  dismissToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | undefined>(
  undefined
);
