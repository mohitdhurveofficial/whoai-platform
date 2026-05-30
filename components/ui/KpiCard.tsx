"use client";
import React from "react";

type Props = {
  title: string;
  value: string | number;
  trend?: string;
  trendValue?: string;
  icon?: any;
};

export function KpiCard({ title, value, trend, trendValue, icon: Icon }: Props) {
  return (
    <div className="bg-white rounded-xl shadow p-6 border">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-gray-500 text-sm">{title}</p>
          <h2 className="text-3xl font-bold mt-2">{value}</h2>
          {trendValue && <p className="text-xs text-slate-500 mt-2">{trendValue}</p>}
        </div>
        {Icon && (
          <div className="text-indigo-600">
            {React.createElement(Icon, { className: "h-8 w-8" })}
          </div>
        )}
      </div>
    </div>
  );
}
