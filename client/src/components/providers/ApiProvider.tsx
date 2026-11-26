import { useEffect, type ReactNode } from "react";
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

  useEffect(() => {
    setClerkTokenGetter(getToken);
  }, [getToken]);

  useEffect(() => {
    if (!isLoaded) return;

    queryClient.clear();

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
  }, [userId, isLoaded, queryClient, toast]);

  return <>{children}</>;
}

export default ApiProvider;
