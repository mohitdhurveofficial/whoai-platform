type StatusBadgeProps = {
  status: string;
};

const statusStyles: Record<string, string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-sky-100 text-sky-700",
  rejected: "bg-rose-100 text-rose-700",
  approvedUpper: "bg-emerald-100 text-emerald-700",
  pendingUpper: "bg-sky-100 text-sky-700",
  rejectedUpper: "bg-rose-100 text-rose-700",
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const normalized = String(status).toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${statusStyles[normalized] ?? "bg-slate-100 text-slate-700"}`}>
      {status}
    </span>
  );
}
