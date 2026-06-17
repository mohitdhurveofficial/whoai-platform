'use client';

import { useState } from "react";

export function ROICalculator() {
  const [monthlySpend, setMonthlySpend] = useState<number | null>(null);
  const estimatedSavings = monthlySpend ? monthlySpend * 0.22 : null; // 22% — illustrative estimate, not a guarantee

  return (
    <div className="bg-[#FAF7F3] rounded-xl border border-[#EEE8E2] p-6 mb-8">
      <h2 className="text-[20px] font-bold text-[#111111] mb-4">
        See how WHOAI pays for itself
      </h2>
      <p className="text-[14px] text-[#666666] mb-4">
        Enter your monthly AI spend below to estimate savings from prevented runaway spend and model optimization.
      </p>
      <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
        <span className="text-[14px] font-semibold text-[#111111]">Monthly AI Spend:</span>
        <input
          type="number"
          placeholder="$0"
          value={monthlySpend ?? ""}
          onChange={(e) => {
            const val = e.target.value.trim();
            setMonthlySpend(val === "" ? null : parseFloat(val) || 0);
          }}
          className="w-32 px-3 py-2 border border-[#EEE8E2] rounded-md text-[14px] focus:outline-none focus:ring-2 focus:ring-[#FF6B00]"
        />
      </div>
      {monthlySpend !== null && monthlySpend > 0 ? (
        <div className="text-[20px] font-bold text-[#FF6B00]">
          Estimated Monthly Savings: ${estimatedSavings?.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </div>
      ) : null}
      {monthlySpend !== null && monthlySpend > 0 ? (
        <p className="text-[13px] text-[#666666] mt-2">
          ^ Illustrative estimate only — assumes ~22% savings from budget enforcement and model
          switching. Your actual results will vary.
        </p>
      ) : null}
    </div>
  );
}