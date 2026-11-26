import { useEffect, useRef, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";

import { setClerkTokenGetter } from "../../services/api";
import { useToast } from "../../hooks/useToast";

interface ApiProviderProps {
  children: ReactNode;
}

function ApiProvider({ children }: ApiProviderProps) {
  const { getToken, userId, isLoaded } = useAuth();
  const queryClient = useQueryClient();
  const toast = useToast();

  const initializedRef = useRef(false);
  const previousUserIdRef = useRef<string | null | undefined>(undefined);

  // Register token getter before child components mount and trigger queries
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

    if (prevUserId !== currentUserId) {
      queryClient.clear();
    }

    if (!prevUserId && currentUserId) {
      toast.success("Signed in successfully. Welcome back!", "Welcome");
    } else if (prevUserId && !currentUserId) {
      toast.info("You have been signed out.", "Signed Out");
    }

    previousUserIdRef.current = currentUserId;
  }, [userId, isLoaded, queryClient, toast]);

  return <>{children}</>;
}

export default ApiProvider;
