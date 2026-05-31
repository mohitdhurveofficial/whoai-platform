import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
};

const trendStyles: Record<NonNullable<KpiCardProps["trend"]>, { label: string; icon: typeof ArrowUpRight | typeof ArrowDownRight | null }> = {
  up: { label: "On track", icon: ArrowUpRight },
  down: { label: "Watch closely", icon: ArrowDownRight },
  neutral: { label: "Stable", icon: null },
};

export function KpiCard({ title, value, icon: Icon, trend, trendValue }: KpiCardProps) {
  const trendData = trend ? trendStyles[trend] : null;

  const TrendIcon = trendData?.icon;

  return (
    <div className="rounded-[28px] border border-slate-200 bg-white p-6 shadow-sm shadow-slate-200/30">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.24em] text-slate-500">{title}</p>
          <p className="mt-4 text-3xl font-semibold text-slate-950">{value}</p>
        </div>
        <div className="rounded-3xl bg-slate-50 p-3 text-slate-600">
          <Icon className="h-5 w-5" />
        </div>
      </div>
      {trendData ? (
        <div className="mt-5 inline-flex items-center gap-2 rounded-full bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700">
          {TrendIcon ? <TrendIcon className="h-3.5 w-3.5" /> : null}
          <span>{trendValue ?? trendData.label}</span>
        </div>
      ) : null}
    </div>
  );
}
