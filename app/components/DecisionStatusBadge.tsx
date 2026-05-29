import type { DecisionStatus } from "@/lib/mockData";

type Props = {
  status: DecisionStatus;
};

const styles: Record<DecisionStatus, string> = {
  Approved: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Pending: "bg-blue-50 text-blue-700 ring-blue-200",
  Rejected: "bg-zinc-100 text-zinc-700 ring-zinc-200",
};

export default function DecisionStatusBadge({ status }: Props) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
    >
      {status}
    </span>
  );
}
