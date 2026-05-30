"use client";
import React from "react";

type Props = {
  level?: string;
};

export function RiskBadge({ level }: Props) {
  const lvl = String(level || "").toLowerCase();
  const cls = lvl.includes("high") || lvl.includes("critical")
    ? "bg-red-100 text-red-700"
    : lvl.includes("medium")
    ? "bg-yellow-100 text-yellow-700"
    : "bg-green-100 text-green-700";

  return <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>{level}</span>;
}
