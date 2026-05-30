"use client";
import React from "react";

type Props = {
  status?: string;
};

export function StatusBadge({ status }: Props) {
  const s = String(status || "");
  const cls = s === "Pending" ? "bg-yellow-100 text-yellow-700" : s === "Approved" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700";
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${cls}`}>{status}</span>;
}
