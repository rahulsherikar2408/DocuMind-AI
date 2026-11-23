import { Moon, Sun } from "lucide-react";
import { useTheme } from "../../hooks/useTheme";

interface ThemeToggleProps {
  className?: string;
  showLabel?: boolean;
}

export function ThemeToggle({ className = "", showLabel = false }: ThemeToggleProps) {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? "Switch to light mode" : "Switch to dark mode"}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      className={`group relative flex items-center gap-2 rounded-xl p-2.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100 cursor-pointer ${className}`}
    >
      <div className="relative h-5 w-5">
        <Sun
          size={20}
          className={`absolute inset-0 transition-transform duration-300 ${
            isDark
              ? "rotate-90 scale-0 opacity-0"
              : "rotate-0 scale-100 opacity-100 text-amber-500"
          }`}
        />
        <Moon
          size={20}
          className={`absolute inset-0 transition-transform duration-300 ${
            isDark
              ? "rotate-0 scale-100 opacity-100 text-indigo-400"
              : "-rotate-90 scale-0 opacity-0"
          }`}
        />
      </div>

      {showLabel && (
        <span className="text-sm font-medium">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

export default ThemeToggle;
