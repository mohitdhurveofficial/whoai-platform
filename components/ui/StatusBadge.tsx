type StatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  approved: "bg-emerald-50 text-emerald-800 ring-1 ring-emerald-200/70 dark:bg-emerald-500/15 dark:text-emerald-200 dark:ring-emerald-400/20",
  active: "bg-blue-50 text-blue-800 ring-1 ring-blue-200/70 dark:bg-blue-500/15 dark:text-blue-200 dark:ring-blue-400/20",
  pending: "bg-amber-50 text-amber-800 ring-1 ring-amber-200/70 dark:bg-amber-500/15 dark:text-amber-200 dark:ring-amber-400/20",
  rejected: "bg-rose-50 text-rose-800 ring-1 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20",
  blocked: "bg-rose-50 text-rose-800 ring-1 ring-rose-200/70 dark:bg-rose-500/15 dark:text-rose-200 dark:ring-rose-400/20",
  escalated: "bg-orange-50 text-orange-800 ring-1 ring-orange-200/70 dark:bg-orange-500/15 dark:text-orange-200 dark:ring-orange-400/20",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = String(status).toLowerCase();
  return (
    <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold leading-none ${statusStyles[normalized] ?? "bg-slate-100 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700"}`}>
      {status}
    </span>
  );
}
