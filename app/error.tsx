"use client";

import React, { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Platform Error Caught by Boundary:", error);
  }, [error]);

  return (
    <div className="flex h-full min-h-[400px] w-full flex-col items-center justify-center rounded-3xl border border-rose-200 bg-rose-50/50 p-8 dark:border-rose-900/50 dark:bg-rose-900/10 m-6">
      <AlertTriangle className="mb-4 h-12 w-12 text-rose-500" />
      <h2 className="mb-2 text-xl font-bold text-slate-900 dark:text-white">Workspace Module Error</h2>
      <p className="mb-6 max-w-md text-center text-sm text-slate-600 dark:text-slate-400">
        A module encountered an unexpected error. This boundary ensures the rest of your workspace remains fully operational.
      </p>
      <button 
        onClick={() => reset()}
        className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-slate-800 dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 transition-all"
      >
        Attempt Recovery
      </button>
    </div>
  );
}