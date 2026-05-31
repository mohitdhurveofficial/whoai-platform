import React from "react";
import { RiskLevel } from "./types";
import { Shield, ShieldAlert, ShieldCheck } from "lucide-react";

export default function DecisionRiskBadge({ level }: { level: RiskLevel }) {
  const config = {
    Low: {
      color: "text-emerald-600 dark:text-emerald-400",
      bg: "bg-emerald-50 dark:bg-emerald-900/20",
      icon: ShieldCheck,
    },
    Medium: {
      color: "text-amber-600 dark:text-amber-400",
      bg: "bg-amber-50 dark:bg-amber-900/20",
      icon: Shield,
    },
    High: {
      color: "text-rose-600 dark:text-rose-400",
      bg: "bg-rose-50 dark:bg-rose-900/20",
      icon: ShieldAlert,
    },
  };

  const { color, bg, icon: Icon } = config[level];

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${color} ${bg}`}>
      <Icon className="h-3.5 w-3.5" />
      {level}
    </span>
  );
}