import { getOverview, getDoctor, getDecisions } from "@/lib/api";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import KpiCard from "../components/KpiCard";
import DecisionTable from "../components/DecisionTable";

export default async function DashboardPage() {
  const overview = await getOverview();
  const doctor = await getDoctor();
  const decisions = await getDecisions();

  return (
    <div className="flex">
      <Sidebar />

      <div className="flex-1 bg-slate-50 min-h-screen">
        <Navbar />

        <main className="p-8">
          <h1 className="text-4xl font-bold mb-8">
            WhoAI Governance Dashboard
          </h1>

          <div className="grid grid-cols-4 gap-4 mb-8">
            <KpiCard title="Agents" value={overview.agents} />
            <KpiCard title="Policies" value={overview.policies} />
            <KpiCard title="API Keys" value={overview.api_keys} />
            <KpiCard title="Risk Score" value={overview.risk_score} />
          </div>

          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <h2 className="text-2xl font-bold mb-4">
              System Health
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <p>Health Score: {doctor.health_score}</p>
              <p>Security Score: {doctor.security_score}</p>
              <p>Policy Coverage: {doctor.policy_coverage}</p>
              <p>Readiness Score: {doctor.readiness_score}</p>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow p-6">
            <h2 className="text-2xl font-bold mb-4">
              Recent Decisions
            </h2>

            <DecisionTable decisions={decisions} />
          </div>
        </main>
      </div>
    </div>
  );
}