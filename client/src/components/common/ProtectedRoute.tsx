import { useAuth } from "@clerk/clerk-react";
import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
    children: ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {

    const { isLoaded, isSignedIn } = useAuth();

    if(!isLoaded) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <p>Loading...</p>
            </div>
        );
    }

    if(!isSignedIn) {
        return <Navigate to="/sign-in" replace />
    }

  return (
    <>{children}</>
  );
}

export default ProtectedRoute;