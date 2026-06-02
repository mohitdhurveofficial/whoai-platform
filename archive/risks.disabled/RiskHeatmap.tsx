import React from "react";
import { Grid } from "lucide-react";

export function RiskHeatmap() {
  const departments = ["Finance", "Operations", "Sales", "Support", "Engineering", "HR"];
  const categories = ["Financial", "Security", "Compliance", "Privacy", "Operational"];
  const fallbackLevels: Record<string, number> = {
    "Finance-Security": 18,
    "Finance-Compliance": 14,
    "Finance-Privacy": 9,
    "Finance-Operational": 17,
    "Operations-Financial": 12,
    "Operations-Security": 19,
    "Operations-Compliance": 16,
    "Operations-Privacy": 11,
    "Operations-Operational": 15,
    "Sales-Financial": 13,
    "Sales-Security": 10,
    "Sales-Privacy": 8,
    "Sales-Operational": 19,
    "Support-Financial": 7,
    "Support-Security": 18,
    "Support-Compliance": 12,
    "Support-Operational": 16,
    "Engineering-Financial": 9,
    "Engineering-Compliance": 14,
    "Engineering-Privacy": 17,
    "Engineering-Operational": 13,
    "HR-Financial": 6,
    "HR-Security": 15,
    "HR-Compliance": 18,
    "HR-Privacy": 19,
    "HR-Operational": 10,
  };
  
  const getHeatmapColor = (level: number) => {
    if (level > 80) return "bg-rose-500 text-white";
    if (level > 50) return "bg-orange-400 text-white";
    if (level > 20) return "bg-amber-300 text-amber-900";
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400";
  };

  const generateMockLevel = (dept: string, cat: string) => {
    if (dept === "Finance" && cat === "Financial") return 85;
    if (dept === "Engineering" && cat === "Security") return 92;
    if (dept === "Support" && cat === "Privacy") return 65;
    if (dept === "Sales" && cat === "Compliance") return 30;
    return fallbackLevels[`${dept}-${cat}`] ?? 5;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-[32px] p-6 shadow-sm overflow-x-auto">
      <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-2">
        <Grid className="w-5 h-5 text-purple-500" /> Risk Heatmap: Departments vs Categories
      </h3>
      <div className="min-w-[600px]">
        <div className="flex mb-2">
          <div className="w-24 shrink-0"></div>
          {categories.map(cat => <div key={cat} className="flex-1 text-center text-xs font-semibold text-slate-500 pb-2">{cat}</div>)}
        </div>
        {departments.map(dept => (
          <div key={dept} className="flex items-center mb-2">
            <div className="w-24 shrink-0 text-xs font-medium text-slate-700 dark:text-slate-300">{dept}</div>
            {categories.map(cat => { const level = generateMockLevel(dept, cat); return <div key={cat} className="flex-1 px-1"><div className={`h-10 rounded-lg flex items-center justify-center text-xs font-bold ${getHeatmapColor(level)} transition-colors cursor-pointer`} title={`${dept} - ${cat}: ${level}`}>{level > 20 ? level : ""}</div></div>; })}
          </div>
        ))}
      </div>
    </div>
  );
}
