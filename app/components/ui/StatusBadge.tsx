type StatusBadgeProps = {
  label: string;
  variant: "approved" | "pending" | "rejected" | "high" | "medium" | "low";
};

const styles: Record<StatusBadgeProps["variant"], string> = {
  approved: "bg-emerald-100 text-emerald-700",
  pending: "bg-sky-100 text-sky-700",
  rejected: "bg-rose-100 text-rose-700",
  high: "bg-rose-100 text-rose-700",
  medium: "bg-amber-100 text-amber-700",
  low: "bg-emerald-100 text-emerald-700",
};

export function StatusBadge({ label, variant }: StatusBadgeProps) {
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[variant]}`}>
      {label}
    </span>
  );
}
