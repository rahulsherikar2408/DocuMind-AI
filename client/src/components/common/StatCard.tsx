import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: number;
  description: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

function StatCard({
  title,
  value,
  description,
  icon: Icon,
  color,
  bgColor,
}: StatCardProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 transition hover:-translate-y-1 hover:shadow-lg hover:shadow-slate-100 dark:border-slate-800 dark:bg-slate-900 dark:hover:border-slate-700 dark:hover:shadow-none">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>

        <div className={`rounded-xl p-3 ${bgColor} ${color}`}>
          <Icon size={21} />
        </div>
      </div>

      <h2 className="mt-5 text-3xl font-bold text-slate-900 dark:text-white">{value}</h2>

      <p className="mt-2 text-xs text-slate-500 dark:text-slate-400">{description}</p>
    </div>
  );
}

export default StatCard;
