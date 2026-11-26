import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";

import { setClerkTokenGetter } from "../../services/api";
import { useToast } from "../../hooks/useToast";
import {
  AUTH_STATE_KEY,
  PENDING_TOAST_KEY,
} from "../../contexts/toastTypes";

interface ApiProviderProps {
  children: ReactNode;
}

function ApiProvider({ children }: ApiProviderProps) {
  const { getToken, userId, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const initializedRef = useRef(false);
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  // Synchronously update token getter so any immediate queries have access to it
  setClerkTokenGetter(getToken);

  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    if (!initializedRef.current) {
      initializedRef.current = true;
      previousUserIdRef.current = userId ?? null;
      return;
    }

    const prevUserId = previousUserIdRef.current;
    const currentUserId = userId ?? null;

    // Only clear cached queries when user identity actually changes (switch user or sign out)
    if (prevUserId !== currentUserId) {
      queryClient.clear();
      try {
        localStorage.removeItem("DOCUMIND_QUERY_CACHE");
      } catch {
        // Ignore storage errors in restricted environments
      }
    }

    try {
      const prevState = sessionStorage.getItem(AUTH_STATE_KEY);

      if (userId) {
        if (prevState === "signed_out") {
          sessionStorage.setItem(AUTH_STATE_KEY, "signed_in");
          toast.success(
            "Signed in successfully. Welcome back!",
            "Welcome"
          );
        } else if (!prevState) {
          sessionStorage.setItem(AUTH_STATE_KEY, "signed_in");
        }
      } else {
        if (prevState === "signed_in") {
          sessionStorage.setItem(AUTH_STATE_KEY, "signed_out");
          sessionStorage.removeItem(PENDING_TOAST_KEY);
          toast.info("You have been signed out.", "Signed Out");
        } else {
          sessionStorage.setItem(AUTH_STATE_KEY, "signed_out");
        }
      }
    } catch {
      // Ignore storage errors in restricted environments
    }

    previousUserIdRef.current = currentUserId;
  }, [userId, isLoaded, queryClient, toast]);

  return <>{children}</>;
}

export default ApiProvider;
