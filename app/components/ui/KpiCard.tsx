import { MetricCard } from "./MetricCard";
import type { LucideIcon } from "lucide-react";

type KpiCardProps = {
  title: string;
  value: string | number;
  icon?: LucideIcon;
  trend?: "up" | "down" | "neutral" | boolean;
  trendValue?: string;
};

export function KpiCard({ title, value, icon, trend, trendValue }: KpiCardProps) {
  // map incoming props to MetricCard props
  const mappedTrend: "positive" | "negative" | "neutral" =
    trend === "up" || trend === true ? "positive" : trend === "down" ? "negative" : "neutral";

  return <MetricCard label={title} value={value} icon={icon} trend={mappedTrend} detail={trendValue} />;
}

export default KpiCard;
