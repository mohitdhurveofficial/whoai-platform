"use client";
import React, { createContext, useContext, useState } from "react";

type Theme = "light" | "dark";

interface DashboardThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const DashboardThemeContext = createContext<DashboardThemeContextType | undefined>(undefined);

export function DashboardThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === "undefined") {
      return "light";
    }

    const stored = localStorage.getItem("whoai-dashboard-theme");
    if (stored === "light" || stored === "dark") {
      return stored;
    }

    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
      ? "dark"
      : "light";
  });

  const toggleTheme = () => {
    setTheme((prev) => {
      const next = prev === "light" ? "dark" : "light";
      try { localStorage.setItem("whoai-dashboard-theme", next); } catch {}
      return next;
    });
  }; 

  // Wrap children in a container that will receive the "dark" class when theme === 'dark'.
  return (
    <DashboardThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme === "dark" ? "dark" : ""}>{children}</div>
    </DashboardThemeContext.Provider>
  );
}

export const useDashboardTheme = () => {
  const ctx = useContext(DashboardThemeContext);
  if (!ctx) throw new Error("useDashboardTheme must be used within DashboardThemeProvider");
  return ctx;
};
