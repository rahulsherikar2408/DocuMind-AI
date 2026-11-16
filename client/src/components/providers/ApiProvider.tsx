import { useEffect, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { useQueryClient } from "@tanstack/react-query";

import { setClerkTokenGetter } from "../../services/api";

interface ApiProviderProps {
    children: ReactNode;
}

function ApiProvider({ children }: ApiProviderProps) {
    const { getToken, userId, isLoaded } = useAuth();
    const queryClient = useQueryClient();

    useEffect(() => {
        setClerkTokenGetter(getToken);
    }, [getToken]);

    useEffect(() => {
        if(isLoaded) {
            queryClient.clear();
        }
    }, [userId, isLoaded, queryClient]);

    return <>{children}</>;
}

export default ApiProvider;