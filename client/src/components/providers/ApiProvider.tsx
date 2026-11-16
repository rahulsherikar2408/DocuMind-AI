import { useEffect, type ReactNode } from "react";
import { useAuth } from "@clerk/react";
import { setClerkTokenGetter } from "../../services/api";

interface ApiProviderProps {
    children: ReactNode;
}

function ApiProvider({ children }: ApiProviderProps) {
    const { getToken } = useAuth();

    useEffect(() => {
        setClerkTokenGetter(getToken);
    }, [getToken]);

    return <>{children}</>;
}

export default ApiProvider;