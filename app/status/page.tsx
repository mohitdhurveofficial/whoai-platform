import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, AlertTriangle, Activity, ArrowRight, HelpCircle } from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { Reveal, Stagger, StaggerItem } from "@/components/marketing/Motion";

export const metadata: Metadata = {
  title: "System Status",
  description: "Current operational status for WHOAI services.",
  alternates: { canonical: "/status" },
};

type HealthState = "operational" | "degraded" | "manual";

async function checkHealth(): Promise<HealthState> {
  const url = process.env.GATEWAY_HEALTH_URL;

  // No health endpoint configured — status is maintained manually.
  if (!url) {
    return "manual";
  }

  try {
    const res = await fetch(url, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    return res.ok ? "operational" : "degraded";
  } catch {
    // Network error, timeout, or DNS failure — treat as a disruption.
    return "degraded";
  }
}

// How each state presents. "manual" deliberately does NOT claim green: with no
// health endpoint configured nothing has actually been checked, and a status
// page that reports "Operational" on the strength of an unset env var is
// exactly the kind of unearned assurance customers audit us for.
const PRESENTATION = {
  operational: {
    Icon: CheckCircle,
    heading: "Operational",
    detail: "All systems are functioning normally.",
    componentLabel: "Operational",
    tone: "text-[#10B981]",
    chip: "bg-[#10B981]/20 text-[#10B981]",
  },
  degraded: {
    Icon: AlertTriangle,
    heading: "Degraded",
    detail: "We're investigating a possible disruption.",
    componentLabel: "Degraded",
    tone: "text-[#F59E00]",
    chip: "bg-[#F59E00]/20 text-[#F59E00]",
  },
  manual: {
    Icon: HelpCircle,
    heading: "Not monitored",
    detail: "Automated health checks are not configured for this deployment.",
    componentLabel: "Not monitored",
    tone: "text-[#666666]",
    chip: "bg-[#666666]/15 text-[#666666]",
  },
} as const;

export default async function StatusPage() {
  const state = await checkHealth();
  const view = PRESENTATION[state];
  const { Icon } = view;

  return (
    <MarketingShell>
      <div className="mx-auto px-6 py-12">
        <div className="max-w-[800px] mx-auto">
          <Reveal>
            <h1 className="text-[32px] font-bold tracking-tight text-[#111111] mb-6">
              System Status
            </h1>
            <p className="text-[18px] text-[#666666] mb-8">
              The live operational status of WHOAI services. We publish status transparently and report
              incidents here as they occur.
            </p>
          </Reveal>

          <Reveal className="mb-12">
            <div className="flex items-center gap-4">
              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${view.chip}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <h2 className="text-[24px] font-bold text-[#111111]">{view.heading}</h2>
                <p className="text-[14px] text-[#666666]">{view.detail}</p>
              </div>
            </div>
          </Reveal>

          <Stagger className="grid gap-6 md:grid-cols-3 mb-12">
            <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
              <h3 className="text-[16px] font-semibold text-[#666666] mb-2">Gateway</h3>
              <p className={`text-[20px] font-bold ${view.tone}`}>{view.componentLabel}</p>
            </StaggerItem>
            <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
              <h3 className="text-[16px] font-semibold text-[#666666] mb-2">Dashboard &amp; API</h3>
              <p className={`text-[20px] font-bold ${view.tone}`}>{view.componentLabel}</p>
            </StaggerItem>
            <StaggerItem hover className="rounded-xl border border-[#EEE8E2] bg-white p-6 transition-shadow hover:shadow-md">
              <h3 className="text-[16px] font-semibold text-[#666666] mb-2">Reported incidents</h3>
              <p className="text-[20px] font-bold text-[#111111]">None</p>
            </StaggerItem>
          </Stagger>

          {state === "manual" && (
            <Reveal className="mb-12">
              <p className="text-[13px] text-[#666666]">
                This page reports live gateway health once <code>GATEWAY_HEALTH_URL</code> is
                configured. Until then, status here is maintained manually — contact us for a
                current update.
              </p>
            </Reveal>
          )}

          <Reveal className="mb-12">
            <h2 className="text-[20px] font-bold text-[#111111] mb-4">Recent Incidents</h2>
            <div className="rounded-lg border border-[#EEE8E2] bg-white p-6 flex items-center gap-3">
              <Activity className={`h-4 w-4 ${view.tone}`} />
              <p className="text-[15px] text-[#666666]">
                No incidents reported. We&apos;ll post any service disruptions here, with updates until resolved.
              </p>
            </div>
          </Reveal>

          <Reveal className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h2 className="text-[20px] font-bold text-[#111111] mb-4">Scheduled Maintenance</h2>
            <p className="text-[15px] text-[#666666]">
              No maintenance scheduled. We provide at least 72 hours&apos; notice for any planned maintenance.
            </p>
          </Reveal>

          <Reveal className="mt-12 text-center">
            <p className="text-[14px] text-[#666666] mb-4">
              Questions about availability or need a status update?
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#FF6B00] text-[#FF6B00] font-medium text-[15px] hover:bg-[#FFF1E8] transition-colors"
            >
              Contact us <ArrowRight className="h-4 w-4" />
            </Link>
          </Reveal>
        </div>
      </div>
    </MarketingShell>
  );
}
