import React from "react";
import { tokens } from "./tokens";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  icon?: React.ElementType;
}

export function Button({ variant = "primary", icon: Icon, children, className = "", ...props }: ButtonProps) {
  const baseClass = "inline-flex min-h-9 items-center justify-center gap-2 rounded-lg px-3.5 py-2 text-sm font-semibold leading-5 transition-all duration-150 focus-visible:whoai-focus disabled:cursor-not-allowed disabled:opacity-55";
  const variantClass = {
    primary: tokens.colors.primaryBg,
    secondary: tokens.colors.secondaryBg,
    danger: "bg-white dark:bg-slate-950 border border-rose-200 dark:border-rose-800/70 text-rose-700 dark:text-rose-200 hover:bg-rose-50 dark:hover:bg-rose-500/10 shadow-sm",
    ghost: "text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800",
  };

  return (
    <button className={`${baseClass} ${variantClass[variant]} ${className}`} {...props}>
      {Icon && <Icon className="h-4 w-4" />}
      {children}
    </button>
  );
}
