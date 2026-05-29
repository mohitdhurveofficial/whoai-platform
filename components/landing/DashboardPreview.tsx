"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  BarChart3,
  Bot,
  CalendarDays,
  CheckCircle2,
  FileClock,
  Gauge,
  LayoutDashboard,
  Plug,
  ScrollText,
  Settings,
  ShieldAlert,
  ShieldCheck,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Cell, Pie, PieChart, Tooltip } from "recharts";

const sidebar = [
  { label: "Dashboard", icon: LayoutDashboard, active: true },
  { label: "Decisions", icon: CheckCircle2 },
  { label: "Approvals", icon: FileClock },
  { label: "Agents", icon: Bot },
  { label: "Policies", icon: ShieldCheck },
  { label: "Audit Logs", icon: ScrollText },
  { label: "Risk Analytics", icon: ShieldAlert },
  { label: "Reports", icon: BarChart3 },
  { label: "Metrics", icon: Gauge },
  { label: "Integrations", icon: Plug },
  { label: "Team", icon: Users },
  { label: "Settings", icon: Settings },
];

const kpis = [
  { label: "Total Decisions", value: "2,936", trend: "+18.2%" },
  { label: "Approved", value: "2,184", trend: "+14.8%" },
  { label: "Needs Review", value: "421", trend: "+6.4%" },
  { label: "Approval Rate", value: "74.4%", trend: "+9.7%" },
];

const riskData = [
  { name: "High Risk", value: 6.0, count: 176, color: "#f15a18" },
  { name: "Medium Risk", value: 19.7, count: 577, color: "#f2b84b" },
  { name: "Low Risk", value: 74.3, count: 2183, color: "#10b981" },
];

const activityRows = [
  {
    icon: Users,
    action: "Finance agent requested vendor payout approval",
    status: "Review queued",
    time: "Just now",
    tone: "red",
  },
  {
    icon: TriangleAlert,
    action: "New tool-access policy deployed to production",
    status: "Synced",
    time: "8m ago",
    tone: "orange",
  },
  {
    icon: Users,
    action: "Support agent action approved by reviewer",
    status: "Approved",
    time: "21m ago",
    tone: "green",
  },
];

export default function DashboardPreview() {
  const [localClock, setLocalClock] = useState({
    dateTime: "Local time",
    timezone: "Detecting timezone",
  });

  useEffect(() => {
    const formatClock = () => {
      const locale = navigator.language || "en-US";
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone || "Local timezone";

      return {
        dateTime: new Intl.DateTimeFormat(locale, {
          weekday: "short",
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          timeZoneName: "short",
        }).format(new Date()),
        timezone,
      };
    };

    const firstTick = window.setTimeout(() => {
      setLocalClock(formatClock());
    }, 0);
    const timer = window.setInterval(() => {
      setLocalClock(formatClock());
    }, 60_000);

    return () => {
      window.clearTimeout(firstTick);
      window.clearInterval(timer);
    };
  }, []);

  return (
    <section className="px-4 py-0 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 28 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.55 }}
        className="mx-auto max-w-[1168px]"
      >
        <div className="premium-panel overflow-hidden rounded-[18px]">
          <div className="grid min-h-[638px] bg-white/80 lg:grid-cols-[238px_1fr]">
            <aside className="border-b border-black/5 bg-white/78 px-7 py-7 lg:border-b-0 lg:border-r">
              <div className="mb-8 flex items-center gap-3">
                <span className="shield-logo h-8 w-7 bg-[#071126]" />
                <div>
                  <p className="text-xl font-black tracking-[-0.04em] text-[#071126]">WHOAI Ops</p>
                </div>
              </div>

              <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">
                Overview
              </p>
              <div className="flex gap-2 overflow-x-auto pb-1 lg:block lg:space-y-1 lg:overflow-visible">
                {sidebar.slice(0, 6).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div
                      key={item.label}
                      className={`flex shrink-0 items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-semibold ${
                        item.active
                          ? "bg-[#071126] text-white shadow-sm"
                          : "text-[#071126] hover:bg-black/5"
                      }`}
                    >
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <p className="mb-3 mt-8 text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">
                Analytics
              </p>
              <div className="space-y-1">
                {sidebar.slice(6, 9).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-semibold text-[#071126]">
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>

              <p className="mb-3 mt-8 text-[10px] font-bold uppercase tracking-[0.12em] text-black/35">
                Settings
              </p>
              <div className="space-y-1">
                {sidebar.slice(9).map((item) => {
                  const Icon = item.icon;

                  return (
                    <div key={item.label} className="flex items-center gap-3 rounded-lg px-4 py-2.5 text-[12px] font-semibold text-[#071126]">
                      <Icon size={14} />
                      <span>{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </aside>

            <div className="p-5 sm:p-7 lg:p-8">
              <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="text-[20px] font-black tracking-[-0.03em] text-[#071126]">
                    Runtime Command Center
                  </h2>
                  <p className="mt-2 text-[11px] font-medium text-[#071126]">
                    Live governance telemetry across autonomous agents
                  </p>
                </div>
                <div className="flex min-h-11 flex-wrap items-center gap-x-3 gap-y-1 rounded-xl border border-black/5 bg-white px-5 py-2 text-[12px] font-semibold text-[#071126] shadow-sm">
                  <span className="h-2 w-2 rounded-full bg-emerald-500" />
                  <span>{localClock.dateTime}</span>
                  <span className="text-[#071126]/45">{localClock.timezone}</span>
                  <CalendarDays size={15} />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                {kpis.map((kpi, index) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 18 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.08, duration: 0.35 }}
                    className="min-h-[112px] rounded-[15px] border border-black/5 bg-white/78 p-5 shadow-[0_8px_22px_rgba(15,23,42,0.04)] transition hover:-translate-y-1"
                  >
                    <p className="text-[11px] font-semibold text-[#071126]">
                      {kpi.label}
                    </p>
                    <div className="mt-5 flex items-end gap-5">
                      <h3 className="text-[28px] font-black tracking-[-0.04em] text-[#071126]">{kpi.value}</h3>
                      <span className="pb-1 text-[10px] font-black text-emerald-500">
                        {kpi.trend}
                      </span>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-7 grid gap-5 xl:grid-cols-[0.92fr_1.18fr]">
                <div className="rounded-[15px] border border-black/5 bg-white/78 p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[13px] font-black text-[#071126]">Risk Distribution</h3>
                  </div>

                  <div className="grid items-center gap-4 sm:grid-cols-[1fr_1.05fr]">
                    <div className="flex min-w-0 justify-center">
                      <PieChart width={220} height={220}>
                        <Pie
                          data={riskData}
                          dataKey="value"
                          nameKey="name"
                          innerRadius={58}
                          outerRadius={87}
                          paddingAngle={4}
                        >
                          {riskData.map((entry) => (
                            <Cell key={entry.name} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </div>

                    <div className="space-y-7">
                      {riskData.map((item) => (
                        <div key={item.name} className="flex items-center gap-3">
                          <span
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: item.color }}
                          />
                          <div className="flex flex-1 items-center justify-between gap-3">
                            <span className="text-[12px] font-semibold text-[#071126]">
                              {item.name}
                            </span>
                            <span className="text-[11px] font-semibold text-[#071126]">
                              {item.count} ({item.value}%)
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[15px] border border-black/5 bg-white/78 p-6 shadow-[0_8px_22px_rgba(15,23,42,0.04)]">
                  <div className="mb-4 flex items-center justify-between">
                    <h3 className="text-[13px] font-black text-[#071126]">Recent Activity</h3>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[520px] text-left text-sm">
                      <tbody>
                        {activityRows.map((row) => {
                          const Icon = row.icon;

                          return (
                          <tr key={row.action} className="border-b border-black/5 last:border-b-0">
                            <td className="py-5 pr-4">
                              <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${
                                row.tone === "red"
                                  ? "bg-red-50 text-red-500"
                                  : row.tone === "green"
                                    ? "bg-emerald-50 text-emerald-500"
                                    : "bg-orange-50 text-orange-500"
                              }`}>
                                <Icon size={16} />
                              </div>
                            </td>
                            <td className="py-5 pr-4 text-[12px] font-semibold text-[#071126]">{row.action}</td>
                            <td className="py-5 pr-4">
                              <span
                                className={`rounded-md px-2.5 py-1 text-[10px] font-black ${
                                  row.tone === "red"
                                    ? "bg-red-50 text-red-500"
                                    : row.tone === "orange"
                                      ? "bg-orange-50 text-orange-600"
                                    : row.tone === "green"
                                      ? "bg-emerald-50 text-emerald-500"
                                      : "bg-black text-white"
                                }`}
                              >
                                {row.status}
                              </span>
                            </td>
                            <td className="py-5 text-right text-[11px] font-medium text-[#071126]/55">
                              {row.time}
                            </td>
                          </tr>
                        );
                        })}
                      </tbody>
                    </table>
                  </div>

                  <a href="#" className="mt-6 inline-flex items-center gap-2 text-[13px] font-bold text-blue-600">
                    View all activity <span className="text-lg">→</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
