import { Check, X } from "lucide-react";
import type { ApprovalRecord } from "@/lib/mockData";
import RiskBadge from "./RiskBadge";

type Props = {
  approvals: ApprovalRecord[];
};

export default function ApprovalTable({ approvals }: Props) {
  return (
    <div className="overflow-hidden rounded-[24px] border border-black/5 bg-white/82 shadow-[0_18px_50px_rgba(7,17,38,0.055)]">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[820px] text-left">
          <thead>
            <tr className="border-b border-black/5 bg-white/60 text-xs uppercase tracking-[0.14em] text-slate-400">
              <th className="px-6 py-4 font-black">Request</th>
              <th className="px-6 py-4 font-black">Agent</th>
              <th className="px-6 py-4 font-black">Risk</th>
              <th className="px-6 py-4 font-black">Requested At</th>
              <th className="px-6 py-4 text-right font-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {approvals.map((approval) => {
              const Icon = approval.icon;

              return (
                <tr key={approval.id} className="border-b border-black/5 last:border-b-0">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-50 text-orange-700">
                        <Icon size={20} />
                      </div>
                      <div>
                        <p className="font-black text-slate-950">{approval.request}</p>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {approval.id} · {approval.owner}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                    {approval.agent}
                  </td>
                  <td className="px-6 py-5">
                    <RiskBadge risk={approval.risk} />
                  </td>
                  <td className="px-6 py-5 text-sm font-medium text-slate-500">
                    {approval.requestedAt}
                  </td>
                  <td className="px-6 py-5">
                    <div className="flex justify-end gap-2">
                      <button className="inline-flex h-10 items-center gap-2 rounded-full bg-slate-950 px-4 text-sm font-bold text-white transition hover:-translate-y-0.5">
                        <Check size={16} />
                        Approve
                      </button>
                      <button className="inline-flex h-10 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-slate-700 ring-1 ring-black/8 transition hover:-translate-y-0.5 hover:text-red-700 hover:ring-red-200">
                        <X size={16} />
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
