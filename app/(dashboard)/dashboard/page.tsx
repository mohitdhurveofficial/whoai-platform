"use client";

import React from "react";
import { useAgents } from "@/lib/hooks/useAgents";
import {
  DollarSign,
  Activity,
  Bot,
  AlertTriangle,
  Calendar,
  RefreshCw,
  Download,
  MoreVertical,
  TrendingUp,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";

// --- Mock Data ---

const spendData = Array.from({ length: 30 }).map((_, i) => ({
  name: `Day ${i + 1}`,
  spend: Math.floor(Math.random() * 500) + 400 + (i * 20),
}));

const modelDistributionData = [
  { name: "GPT-4o", value: 52 },
  { name: "Claude", value: 31 },
  { name: "Gemini", value: 17 },
];

const modelColors = ["#FF6B00", "#111111", "#A3A3A3"];

const topAgents = [
  { name: "Support Agent", model: "GPT-4o", tokens: "12.4M", spend: "$8,423", requests: "142K", status: "Active" },
  { name: "Research Agent", model: "Claude 3.5", tokens: "8.7M", spend: "$6,231", requests: "84K", status: "Active" },
  { name: "Sales Agent", model: "Gemini 1.5", tokens: "6.1M", spend: "$4,985", requests: "56K", status: "Paused" },
];

const recentAlerts = [
  { message: "Support Agent exceeded daily budget", severity: "High" },
  { message: "GPT-4o spend increased by 38%", severity: "Medium" },
  { message: "Daily spend crossed $800", severity: "Medium" },
];

const spendByModelData = [
  { name: "GPT-4o", spend: 14200 },
  { name: "Claude 3.5", spend: 8500 },
  { name: "Gemini 1.5", spend: 4300 },
];

export default function DashboardPage() {
  const { agents } = useAgents();

  const totalAgents = agents.length;
  const activeAgents = agents.filter(a => a.status === 'ACTIVE').length;
  const pausedAgents = agents.filter(a => a.status === 'PAUSED').length;
  const totalMonthlyBudget = agents.reduce((sum, a) => sum + Number(a.monthlyBudget), 0);

  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-10">
      
      {/* TOP HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">AI Spend Command Center 👋</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">Monitor AI spend, token usage, and agent performance in real time.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FFFFFF] border border-[#EEE8E2] px-3 py-2 rounded-md shadow-sm text-[13px] font-medium text-[#111111] hover:border-[#DCD5CD] transition-colors">
            <Calendar className="h-4 w-4 text-[#888888]" />
            Last 30 Days
            <MoreVertical className="h-4 w-4 text-[#888888] -ml-1" />
          </button>
          <button className="flex items-center gap-2 bg-[#FFFFFF] border border-[#EEE8E2] px-3 py-2 rounded-md shadow-sm text-[13px] font-medium text-[#111111] hover:border-[#DCD5CD] transition-colors">
            <RefreshCw className="h-4 w-4 text-[#888888]" />
            Refresh
          </button>
          <button className="flex items-center gap-2 bg-[#111111] border border-[#111111] px-3 py-2 rounded-md shadow-sm text-[13px] font-medium text-[#FFFFFF] hover:bg-[#222222] transition-colors">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* SECTION 1: KPI CARDS */}
      <section className="grid grid-cols-5 gap-5">
        
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#888888] uppercase tracking-wider">Total Agents</span>
            <div className="p-1.5 bg-[#F5F5F5] rounded text-[#111111]"><Bot className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-[#111111]">{totalAgents}</div>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[#888888]">
              Total registered
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#888888] uppercase tracking-wider">Active Agents</span>
            <div className="p-1.5 bg-[#F0FDF4] rounded text-[#16A34A]"><Bot className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-[#111111]">{activeAgents}</div>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[#047857]">
              Currently running
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#888888] uppercase tracking-wider">Paused Agents</span>
            <div className="p-1.5 bg-[#FFFBEB] rounded text-[#D97706]"><Bot className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-[#111111]">{pausedAgents}</div>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[#D97706]">
              Stopped manually
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#888888] uppercase tracking-wider">Total Monthly Budget</span>
            <div className="p-1.5 bg-[#FFF5F0] rounded text-[#FF6B00]"><DollarSign className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-[#111111]">${totalMonthlyBudget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[#FF6B00]">
              Combined limit
            </div>
          </div>
        </div>

        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-5 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-semibold text-[#888888] uppercase tracking-wider">Active Alerts</span>
            <div className="p-1.5 bg-[#FFF0F0] rounded text-[#DC2626]"><AlertTriangle className="h-4 w-4" /></div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold tracking-tight text-[#DC2626]">3</div>
            <div className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-[#DC2626]">
              Requires attention
            </div>
          </div>
        </div>

      </section>

      {/* SECTION 2: LARGE CHART & TABLE */}
      <section className="grid grid-cols-3 gap-5">
        
        {/* Large Chart */}
        <div className="col-span-2 bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm">
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[#111111]">AI Spend Over Time</h2>
            <p className="text-[13px] text-[#888888] mt-1">30 day spend trend across all models and agents</p>
          </div>
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={spendData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A3A3A3" }} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A3A3A3" }} tickFormatter={(val) => `$${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "500", padding: "8px 12px" }} 
                  itemStyle={{ color: "#FF6B00" }} 
                  cursor={{ stroke: '#EEE8E2', strokeWidth: 2 }} 
                />
                <Line type="monotone" dataKey="spend" stroke="#FF6B00" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#FF6B00", stroke: "#FFFFFF", strokeWidth: 2 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Spending Agents Table */}
        <div className="col-span-1 bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl shadow-sm flex flex-col overflow-hidden">
          <div className="p-5 border-b border-[#EEE8E2] shrink-0 bg-[#FAFAFA]">
            <h2 className="text-[16px] font-bold text-[#111111]">Top Spending Agents</h2>
            <p className="text-[13px] text-[#888888] mt-1">Highest burn rate by volume</p>
          </div>
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left text-[13px]">
              <thead className="bg-[#FFFFFF] border-b border-[#EEE8E2] sticky top-0">
                <tr>
                  <th className="px-5 py-3 font-semibold text-[#888888]">Agent</th>
                  <th className="px-5 py-3 font-semibold text-[#888888]">Model</th>
                  <th className="px-5 py-3 font-semibold text-[#888888] text-right">Spend</th>
                  <th className="px-5 py-3 font-semibold text-[#888888]">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EEE8E2]">
                {topAgents.map((agent, i) => (
                  <tr key={i} className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-5 py-4 font-semibold text-[#111111]">
                      {agent.name}
                      <div className="text-[11px] font-normal text-[#888888] mt-0.5">{agent.tokens} tokens · {agent.requests} reqs</div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#F5F5F5] text-[#111111] font-medium text-[11px]">
                        {agent.model}
                      </span>
                    </td>
                    <td className="px-5 py-4 font-bold text-[#111111] text-right">{agent.spend}</td>
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5">
                        <div className={`w-2 h-2 rounded-full ${agent.status === "Active" ? "bg-[#047857]" : "bg-[#A3A3A3]"}`}></div>
                        <span className={`text-[12px] font-medium ${agent.status === "Active" ? "text-[#047857]" : "text-[#888888]"}`}>{agent.status}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </section>

      {/* SECTION 3: THREE CARDS */}
      <section className="grid grid-cols-3 gap-5">
        
        {/* Card 1: Model Distribution */}
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-2">
            <h2 className="text-[16px] font-bold text-[#111111]">Model Distribution</h2>
            <p className="text-[13px] text-[#888888] mt-1">Token volume by provider</p>
          </div>
          <div className="flex-1 min-h-[220px] relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={modelDistributionData} cx="50%" cy="50%" innerRadius={65} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                  {modelDistributionData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={modelColors[index % modelColors.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "500" }} 
                  itemStyle={{ color: "#FFFFFF" }} 
                />
              </PieChart>
            </ResponsiveContainer>
            {/* Custom Legend */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center">
              <span className="block text-[22px] font-bold text-[#111111]">100%</span>
              <span className="block text-[11px] font-medium text-[#888888] uppercase">Monitored</span>
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2">
            {modelDistributionData.map((model, i) => (
              <div key={model.name} className="flex items-center gap-1.5 text-[12px] font-medium text-[#111111]">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: modelColors[i] }}></div>
                {model.name} <span className="text-[#888888]">{model.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Card 2: Recent Alerts */}
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-0 shadow-sm flex flex-col overflow-hidden">
          <div className="p-6 border-b border-[#EEE8E2]">
            <h2 className="text-[16px] font-bold text-[#111111]">Recent Alerts</h2>
            <p className="text-[13px] text-[#888888] mt-1">Anomalies and budget warnings</p>
          </div>
          <div className="flex-1 divide-y divide-[#EEE8E2] overflow-auto">
            {recentAlerts.map((alert, i) => (
              <div key={i} className="p-5 flex items-start gap-4 hover:bg-[#FAFAFA] transition-colors">
                <div className={`mt-0.5 p-1.5 rounded-md ${alert.severity === "High" ? "bg-[#FFF0F0] text-[#DC2626]" : "bg-[#FFF5F0] text-[#FF6B00]"}`}>
                  <AlertTriangle className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-[13px] font-semibold text-[#111111]">{alert.message}</p>
                  <p className="text-[12px] font-medium text-[#888888] mt-1">{alert.severity} Priority • Just now</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Card 3: Spend by Model */}
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm flex flex-col">
          <div className="mb-6">
            <h2 className="text-[16px] font-bold text-[#111111]">Spend by Model</h2>
            <p className="text-[13px] text-[#888888] mt-1">Cost breakdown across providers</p>
          </div>
          <div className="flex-1 h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={spendByModelData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888888" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#A3A3A3" }} tickFormatter={(val) => `$${val/1000}k`} />
                <Tooltip 
                  cursor={{ fill: "#FAFAFA" }} 
                  contentStyle={{ backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "500" }} 
                />
                <Bar dataKey="spend" fill="#FF6B00" radius={[4, 4, 0, 0]} maxBarSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </section>

    </div>
  );
}
