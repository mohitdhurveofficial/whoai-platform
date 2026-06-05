import Link from "next/link";
import { redirect } from "next/navigation";
import { Plus } from "lucide-react";
import { AgentsAnalyticsTable } from "@/app/components/analytics/AgentsAnalyticsTable";
import { getAgentsAnalytics } from "@/lib/analytics/service";
import { getServerAuthContext } from "@/lib/server/auth";

export default async function AgentsPage() {
  const auth = await getServerAuthContext();
  if (!auth) redirect("/login");

  const agents = await getAgentsAnalytics(auth.organizationId);

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 p-6 text-[#111111] md:p-10">
      <header className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight">Agents</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">
            Manage agents and inspect spend, request volume, blocked activity, and budget health.
          </p>
        </div>
        <Link href="/agents/new" className="inline-flex items-center justify-center gap-2 rounded-md bg-[#FF6B00] px-4 py-2.5 text-[13px] font-semibold text-white shadow-sm">
          <Plus className="h-4 w-4" />
          Create Agent
        </Link>
      </header>

      <AgentsAnalyticsTable agents={agents} />
    </div>
  );
}
