import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type MetricCardProps = {
  label: string;
  value: string | number;
  detail?: string;
  icon?: LucideIcon;
  trend?: "positive" | "negative" | "neutral";
};

export function MetricCard({ label, value, detail, icon: Icon, trend }: MetricCardProps) {
  return (
    <div className="whoai-card whoai-card-hover p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[11px] font-semibold uppercase text-slate-500 dark:text-slate-400">{label}</p>
          <p className="mt-3 text-3xl font-semibold leading-none text-slate-950 dark:text-white">{value}</p>
        </div>
        {Icon ? (
          <div className="rounded-lg bg-orange-50 p-2.5 text-orange-700 ring-1 ring-orange-200/70 dark:bg-orange-500/10 dark:text-orange-200 dark:ring-orange-400/20">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-300">{detail}</p> : null}
      {trend ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-md bg-slate-100 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
          {trend === "positive" ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> : trend === "negative" ? <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" /> : null}
          <span>{trend === "positive" ? "On track" : trend === "negative" ? "Watch closely" : "Stable"}</span>
        </div>
      ) : null}
    </div>
  );
}
