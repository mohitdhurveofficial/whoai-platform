import type { RiskLevel } from "@/lib/mockData";

type Props = {
  risk: RiskLevel;
};

const styles: Record<RiskLevel, string> = {
  "High Risk": "bg-red-50 text-red-700 ring-red-200",
  "Medium Risk": "bg-amber-50 text-amber-700 ring-amber-200",
  "Low Risk": "bg-emerald-50 text-emerald-700 ring-emerald-200",
};

export default function RiskBadge({ risk }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[risk]}`}
    >
      {risk}
    </span>
  );
}
