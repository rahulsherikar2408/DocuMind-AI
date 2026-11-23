import { Sun, Moon, Laptop, User, Shield, Check, Palette } from "lucide-react";
import DashboardLayout from "../components/layout/DashboardLayout";
import { useTheme, type Theme } from "../hooks/useTheme";
import { useCurrentUser } from "../hooks/useUser";

function Settings() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { data: user } = useCurrentUser();

  const themeOptions: {
    id: Theme;
    label: string;
    description: string;
    icon: typeof Sun;
  }[] = [
    {
      id: "light",
      label: "Light Mode",
      description: "Clean, bright interface optimal for daytime use",
      icon: Sun,
    },
    {
      id: "dark",
      label: "Dark Mode",
      description: "Easy on the eyes in low-light environments",
      icon: Moon,
    },
    {
      id: "system",
      label: "System Preference",
      description: "Automatically matches your operating system theme",
      icon: Laptop,
    },
  ];

  return (
    <DashboardLayout>
      <div className="mx-auto max-w-4xl space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white sm:text-3xl">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Manage your account preferences, appearance, and workspace settings.
          </p>
        </div>

        {/* Appearance / Theme Settings */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <Palette size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Appearance & Theme
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Choose how DocuMind AI looks to you. Active theme:{" "}
                <span className="font-semibold capitalize text-indigo-600 dark:text-indigo-400">
                  {theme} ({resolvedTheme})
                </span>
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {themeOptions.map((option) => {
              const Icon = option.icon;
              const isSelected = theme === option.id;

              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTheme(option.id)}
                  className={`group relative flex flex-col justify-between rounded-xl border p-5 text-left transition cursor-pointer ${
                    isSelected
                      ? "border-indigo-600 bg-indigo-50/50 shadow-sm ring-2 ring-indigo-500/20 dark:border-indigo-500 dark:bg-indigo-950/30"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:bg-slate-800/60"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <div
                        className={`rounded-lg p-2.5 transition ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "bg-slate-100 text-slate-600 group-hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:group-hover:bg-slate-700"
                        }`}
                      >
                        <Icon size={20} />
                      </div>

                      {isSelected && (
                        <span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white dark:bg-indigo-500">
                          <Check size={14} strokeWidth={3} />
                        </span>
                      )}
                    </div>

                    <h3 className="mt-4 font-semibold text-slate-900 dark:text-white">
                      {option.label}
                    </h3>

                    <p className="mt-1 text-xs leading-relaxed text-slate-500 dark:text-slate-400">
                      {option.description}
                    </p>
                  </div>

                  {/* Visual preview box */}
                  <div
                    className={`mt-4 rounded-lg border p-2 text-[10px] ${
                      option.id === "dark" || (option.id === "system" && resolvedTheme === "dark")
                        ? "border-slate-800 bg-slate-950 text-slate-400"
                        : "border-slate-200 bg-slate-50 text-slate-600"
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-indigo-500" />
                      <span className="font-medium">
                        {option.id === "system" ? "Auto Adaptive" : option.label}
                      </span>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Account Information */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="rounded-xl bg-indigo-50 p-2.5 text-indigo-600 dark:bg-indigo-950/60 dark:text-indigo-400">
              <User size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Account Details
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Your authenticated user profile and subscription tier
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Full Name
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user?.firstName ? `${user.firstName} ${user.lastName || ""}` : "Not provided"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Email Address
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                {user?.email || "Signed In"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Subscription Plan
              </p>
              <p className="mt-1 text-sm font-semibold text-indigo-600 capitalize dark:text-indigo-400">
                {user?.plan || "Free"} Plan
              </p>
            </div>

            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-800/50">
              <p className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                Workspace Role
              </p>
              <p className="mt-1 text-sm font-semibold text-slate-800 dark:text-slate-200">
                Member / Document Owner
              </p>
            </div>
          </div>
        </section>

        {/* Security & System Info */}
        <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-colors dark:border-slate-800 dark:bg-slate-900 sm:p-8">
          <div className="flex items-center gap-3 border-b border-slate-100 pb-5 dark:border-slate-800">
            <div className="rounded-xl bg-emerald-50 p-2.5 text-emerald-600 dark:bg-emerald-950/60 dark:text-emerald-400">
              <Shield size={22} />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                Privacy & Data Security
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                How your documents and AI interactions are secured
              </p>
            </div>
          </div>

          <div className="mt-4 space-y-3 text-sm text-slate-600 dark:text-slate-300">
            <p>
              Your uploaded PDF documents are stored securely with user-specific isolation.
              Only you have access to search, summarize, or query them.
            </p>
            <p className="text-xs text-slate-400 dark:text-slate-500">
              Theme preference is saved locally on your browser.
            </p>
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}

export default Settings;
