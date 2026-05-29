"use client";

import { useMemo, useState } from "react";
import { ArrowUpRight, Download, ShieldCheck } from "lucide-react";
import DecisionFilters, {
  type DecisionFilter,
} from "../components/DecisionFilters";
import DecisionStatusBadge from "../components/DecisionStatusBadge";
import RiskBadge from "../components/RiskBadge";
import { decisions } from "@/lib/mockData";

export default function DecisionsPage() {
  const [activeFilter, setActiveFilter] = useState<DecisionFilter>("All");
  const [search, setSearch] = useState("");

  const filteredDecisions = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return decisions.filter((decision) => {
      const matchesFilter =
        activeFilter === "All" ||
        decision.risk === activeFilter ||
        decision.status === activeFilter;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        [
          decision.id,
          decision.agent,
          decision.action,
          decision.policy,
          decision.status,
        ]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesFilter && matchesSearch;
    });
  }, [activeFilter, search]);

  return (
    <main className="min-h-screen bg-[#f8f5ef] px-4 py-6 text-slate-950 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-[1320px]">
        <section className="rounded-[32px] border border-black/5 bg-white/72 p-5 shadow-[0_24px_80px_rgba(7,17,38,0.07)] sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-orange-50 px-3 py-1.5 text-sm font-bold text-orange-700 ring-1 ring-orange-100">
                <ShieldCheck size={16} />
                Runtime Governance
              </div>
              <h1 className="mt-5 text-4xl font-black tracking-[-0.05em] sm:text-5xl">
                Decision Center
              </h1>
              <p className="mt-3 max-w-2xl text-base font-medium leading-7 text-slate-500">
                Monitor every AI decision across your organization.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button className="inline-flex h-11 items-center gap-2 rounded-full bg-white px-4 text-sm font-bold text-slate-700 ring-1 ring-black/8 transition hover:-translate-y-0.5">
                <Download size={16} />
                Export
              </button>
              <button className="inline-flex h-11 items-center gap-2 rounded-full bg-slate-950 px-5 text-sm font-bold text-white shadow-lg shadow-slate-950/10 transition hover:-translate-y-0.5">
                Open Audit Log
                <ArrowUpRight size={16} />
              </button>
            </div>
          </div>

          <div className="mt-8">
            <DecisionFilters
              activeFilter={activeFilter}
              search={search}
              onFilterChange={setActiveFilter}
              onSearchChange={setSearch}
            />
          </div>

          <div className="mt-6 overflow-hidden rounded-[24px] border border-black/5 bg-white/86 shadow-[0_18px_50px_rgba(7,17,38,0.045)]">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[980px] text-left">
                <thead>
                  <tr className="border-b border-black/5 bg-white/60 text-xs uppercase tracking-[0.14em] text-slate-400">
                    <th className="px-6 py-4 font-black">Decision ID</th>
                    <th className="px-6 py-4 font-black">Agent</th>
                    <th className="px-6 py-4 font-black">Risk Score</th>
                    <th className="px-6 py-4 font-black">Policy</th>
                    <th className="px-6 py-4 font-black">Status</th>
                    <th className="px-6 py-4 font-black">Timestamp</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredDecisions.map((decision) => (
                    <tr
                      key={decision.id}
                      className="border-b border-black/5 transition last:border-b-0 hover:bg-orange-50/35"
                    >
                      <td className="px-6 py-5">
                        <p className="font-black text-slate-950">{decision.id}</p>
                        <p className="mt-1 text-sm font-medium text-slate-500">
                          {decision.action}
                        </p>
                      </td>
                      <td className="px-6 py-5 text-sm font-semibold text-slate-700">
                        {decision.agent}
                      </td>
                      <td className="px-6 py-5">
                        <div className="flex items-center gap-3">
                          <RiskBadge risk={decision.risk} />
                          <span className="text-sm font-black text-slate-950">
                            {decision.riskScore}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-600">
                        {decision.policy}
                      </td>
                      <td className="px-6 py-5">
                        <DecisionStatusBadge status={decision.status} />
                      </td>
                      <td className="px-6 py-5 text-sm font-medium text-slate-500">
                        {decision.timestamp}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="flex flex-col gap-3 border-t border-black/5 px-6 py-4 text-sm font-semibold text-slate-500 sm:flex-row sm:items-center sm:justify-between">
              <span>
                Showing {filteredDecisions.length} of {decisions.length} decisions
              </span>
              <span>Updated from governance event stream</span>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
