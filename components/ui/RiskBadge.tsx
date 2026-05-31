type RiskBadgeProps = {
  level: "Low" | "Medium" | "High" | "Critical" | string;
};

const styles: Record<string, string> = {
  Low: "bg-emerald-100 text-emerald-700",
  Medium: "bg-amber-100 text-amber-700",
  High: "bg-rose-100 text-rose-700",
  Critical: "bg-rose-200 text-rose-800",
};

export function RiskBadge({ level }: RiskBadgeProps) {
  const normalized = String(level).charAt(0).toUpperCase() + String(level).slice(1).toLowerCase();
  return (
    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${styles[normalized] ?? "bg-slate-100 text-slate-700"}`}>
      {normalized}
    </span>
  );
}
