"use client";
import React from "react";
import { Moon, Sun } from "lucide-react";
import { useDashboardTheme } from "./DashboardThemeProvider";

export default function DashboardThemeToggle() {
  const { theme, toggleTheme } = useDashboardTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
      aria-label="Toggle dashboard theme"
    >
      {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
    </button>
  );
}
