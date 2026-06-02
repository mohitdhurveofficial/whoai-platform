import React from "react";
import { tokens } from "./tokens";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "success" | "warning" | "critical" | "info" | "primary" | "secondary";
  showDot?: boolean;
  icon?: React.ElementType;
}

export function Badge({ children, variant = "secondary", showDot, icon: Icon }: BadgeProps) {
  const variantClasses = {
    success: tokens.colors.successBg,
    warning: tokens.colors.warningBg,
    critical: tokens.colors.criticalBg,
    info: tokens.colors.infoBg,
    primary: tokens.colors.primaryLightBg,
    secondary: tokens.colors.disabledBg,
  };

  const dotClasses = {
    success: "bg-emerald-500",
    warning: "bg-amber-500",
    critical: "bg-rose-500",
    info: "bg-blue-500",
    primary: "bg-orange-500",
    secondary: "bg-slate-500",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-[11px] font-semibold leading-none ${variantClasses[variant]}`}>
      {showDot && <span className={`h-1.5 w-1.5 rounded-full ${dotClasses[variant]}`}></span>}
      {Icon && <Icon className="h-3.5 w-3.5" />}
      {children}
    </span>
  );
}
