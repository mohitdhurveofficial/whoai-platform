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
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{label}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        {Icon ? (
          <div className="rounded-3xl bg-slate-50 p-3 text-slate-600">
            <Icon className="h-5 w-5" />
          </div>
        ) : null}
      </div>
      {detail ? <p className="mt-4 text-sm leading-6 text-slate-600">{detail}</p> : null}
      {trend ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
          {trend === "positive" ? <ArrowUpRight className="h-3.5 w-3.5 text-emerald-600" /> : trend === "negative" ? <ArrowDownRight className="h-3.5 w-3.5 text-rose-600" /> : null}
          <span>{trend === "positive" ? "On track" : trend === "negative" ? "Watch closely" : "Stable"}</span>
        </div>
      ) : null}
    </div>
  );
}
