"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

interface SpendDay {
  date: string;
  costUsd: number;
}

interface DepartmentSpend {
  name: string;
  costUsd: number;
}

const COLORS = [
  "#0ea5e9",
  "#8b5cf6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
];

interface AnalyticsChartProps {
  spendByDay: SpendDay[];
  spendByDepartment: DepartmentSpend[];
}

export default function AnalyticsChart({
  spendByDay,
  spendByDepartment,
}: AnalyticsChartProps) {
  return (
    <>
      <section className="lg:col-span-2 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">
            7-Day Spend Velocity
          </h2>
          <p className="text-sm text-slate-500 font-medium">Daily aggregated API burn rate across all models.</p>
        </div>

        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={spendByDay}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
            <XAxis dataKey="date" stroke="#94a3b8" tick={{fontSize: 12}} tickMargin={10} axisLine={false} tickLine={false} />
            <YAxis stroke="#94a3b8" tick={{fontSize: 12}} tickFormatter={(val) => `$${val}`} axisLine={false} tickLine={false} />
            <Tooltip cursor={{ stroke: '#cbd5e1' }} contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }} />
            <Line
              type="monotone"
              dataKey="costUsd"
              stroke="#0ea5e9"
              strokeWidth={3}
              dot={{ fill: "#0ea5e9", r: 4, strokeWidth: 2, stroke: "#fff" }} 
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-col">
        <div className="mb-6">
          <h2 className="text-lg font-bold text-slate-900">Department Allocation</h2>
          <p className="text-sm text-slate-500 font-medium">Estimated chargebacks.</p>
        </div>
        <ResponsiveContainer width="100%" height={200} className="mt-auto">
          <PieChart>
            <Pie
              data={spendByDepartment}
              dataKey="costUsd"
              nameKey="name"
              cx="50%" cy="50%" innerRadius={60} 
              outerRadius={80}
              paddingAngle={2}
            >
              {spendByDepartment.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
        <div className="mt-4 space-y-2">
          {spendByDepartment.map((dept, i) => (
            <div key={dept.name} className="flex justify-between text-sm">
              <span className="flex items-center gap-2 text-slate-600">
                <div className="w-2 h-2 rounded-full" style={{backgroundColor: COLORS[i % COLORS.length]}}></div>
                {dept.name}
              </span>
              <span className="font-bold text-slate-900">${dept.costUsd.toFixed(2)}</span>
            </div>
          ))}
        </div>
      </section>
    </>
  );
}