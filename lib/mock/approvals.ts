import { approvals as _approvals, decisions as _decisions } from "@/lib/mockData";

export const MOCK_APPROVALS = _approvals.map((app, idx) => {
  const decision = _decisions.find((d) => d.agent === app.agent) || _decisions[idx % _decisions.length];

  return {
    ...app,
    decisionId: decision?.id ?? null,
    status: decision?.status ?? "Pending",
    reviewedBy: Math.random() > 0.6 ? "System Admin" : "-",
  } as any;
});
