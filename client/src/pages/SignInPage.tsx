import { SignIn, useAuth } from "@clerk/react";
import { Link, Navigate } from "react-router-dom";
import { BrainCircuit } from "lucide-react";
import ThemeToggle from "../components/common/ThemeToggle";

function SignInPage() {
  const { isLoaded, isSignedIn } = useAuth();

  if (isLoaded && isSignedIn) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-indigo-50/70 via-slate-50 to-white px-4 py-20 transition-colors duration-200 dark:from-slate-900 dark:via-slate-950 dark:to-slate-950">
      {/* Top Bar with Logo and Theme Toggle */}
      <div className="absolute top-4 left-4 right-4 flex items-center justify-between sm:top-6 sm:left-8 sm:right-8">
        <Link to="/" className="flex items-center gap-2">
          <div className="rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-200 dark:shadow-none">
            <BrainCircuit size={22} />
          </div>
          <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
            DocuMind<span className="text-indigo-600 dark:text-indigo-400"> AI</span>
          </span>
        </Link>

        <ThemeToggle />
      </div>

      <div className="flex w-full max-w-md justify-center">
        <SignIn
          routing="path"
          path="/sign-in"
          signUpUrl="/sign-up"
          forceRedirectUrl="/dashboard"
          fallbackRedirectUrl="/dashboard"
        />
      </div>
    </div>
  );
}

export default SignInPage;
