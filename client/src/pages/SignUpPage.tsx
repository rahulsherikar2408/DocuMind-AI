import { SignUp } from "@clerk/react";
import ThemeToggle from "../components/common/ThemeToggle";
import { Link } from "react-router-dom";
import { BrainCircuit } from "lucide-react";

function SignUpPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-slate-50 p-4 transition-colors duration-200 dark:bg-slate-950">
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

      <div className="w-full max-w-md pt-12 sm:pt-0">
        <SignUp 
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
        />
      </div>
    </div>
  );
}

export default SignUpPage;
