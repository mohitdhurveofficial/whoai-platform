import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, AlertTriangle, ArrowRight } from "lucide-react";

export const metadata: Metadata = {
  title: "System Status",
  description: "Current status, uptime, and incident history for WHOAI services.",
  alternates: { canonical: "/status" },
};

export default function StatusPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] mx-auto px-6 py-12 bg-[#FAF7F3]">
      <div className="max-w-[800px] mx-auto">
        <h1 className="text-[32px] font-bold tracking-tight text-[#111111] mb-6">
          System Status
        </h1>
        <p className="text-[18px] text-[#666666] mb-8">
          Current status, uptime, and incident history for WHOAI services.
        </p>

        {/* Current Status */}
        <div className="mb-12">
          <div className="flex items-center gap-4">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#10B981]/20 text-[#10B981]">
              <CheckCircle className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-[24px] font-bold text-[#111111]">Operational</h2>
              <p className="text-[14px] text-[#666666]">
                All systems are functioning normally.
              </p>
            </div>
          </div>
        </div>

        {/* Uptime Stats */}
        <div className="grid gap-6 md:grid-cols-3 mb-12">
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[16px] font-semibold text-[#666666] mb-2">Uptime (30 days)</h3>
            <p className="text-[32px] font-bold text-[#111111]">99.99%</p>
          </div>
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[16px] font-semibold text-[#666666] mb-2">Uptime (90 days)</h3>
            <p className="text-[32px] font-bold text-[#111111]">99.98%</p>
          </div>
          <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
            <h3 className="text-[16px] font-semibold text-[#666666] mb-2">Uptime (365 days)</h3>
            <p className="text-[32px] font-bold text-[#111111]">99.95%</p>
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="mb-12">
          <h2 className="text-[20px] font-bold text-[#111111] mb-4">
            Recent Incidents
          </h2>
          <div className="space-y-4">
            <div className="rounded-lg border border-[#EEE8E2] bg-white p-5">
              <div className="flex items-center gap-3 mb-2">
                <CheckCircle className="h-4 w-4 text-[#10B981]" />
                <span className="text-[14px] font-semibold text-[#111111]">Resolved</span>
                <time className="text-[12px] text-[#666666] ml-auto">Jun 10, 2026</time>
              </div>
              <h3 className="text-[16px] font-bold text-[#111111]">Degraded GPU performance</h3>
              <p className="text-[14px] text-[#666666]">
                Temporary slowdown in inference response times due to a driver update. Resolved after rolling back
                to the previous stable driver version.
              </p>
            </div>
            <div className="rounded-lg border border-[#EEE8E2] bg-white p-5">
              <div className="flex items-center gap-3 mb-2">
                <AlertTriangle className="h-4 w-4 text-[#F59E00]" />
                <span className="text-[14px] font-semibold text-[#111111]">Monitoring</span>
                <time className="text-[12px] text-[#666666] ml-auto">Jun 8, 2026</time>
              </div>
              <h3 className="text-[16px] font-bold text-[#111111]">Increased error rates in us-east-1</h3>
              <p className="text-[14px] text-[#666666]">
                Elevated 5xx errors observed in the us-east-1 region. Auto-scaling group adjusted to handle
                increased load. Currently monitoring.
              </p>
            </div>
          </div>
          <p className="text-[14px] text-[#666666] mt-4">
            <Link href="/status/incidents" className="text-[#FF6B00] font-medium hover:underline">
              View full incident history
            </Link>
          </p>
        </div>

        {/* Maintenance */}
        <div className="rounded-xl border border-[#EEE8E2] bg-white p-6">
          <h2 className="text-[20px] font-bold text-[#111111] mb-4">
            Scheduled Maintenance
          </h2>
          <p className="text-[15px] text-[#666666]">
            No maintenance scheduled at this time. We provide at least 72 hours notice for any planned
            maintenance that may affect service availability.
          </p>
        </div>

        {/* Subscribe for Updates */}
        <div className="mt-12 text-center">
          <p className="text-[14px] text-[#666666] mb-4">
            Stay informed about service status and incidents.
          </p>
          <Link
            href="https://status.whoai.ai"
            className="inline-flex items-center gap-2 px-5 py-3 rounded-md border border-[#FF6B00] text-[#FF6B00] font-medium text-[15px] hover:bg-[#FFF1E8] transition-colors"
          >
            Subscribe to status updates <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}