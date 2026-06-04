"use client";

import React from "react";
import { Download, Calendar, Filter } from "lucide-react";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts";

// --- Mock Data ---

const spendOverTimeData = Array.from({ length: 30 }).map((_, i) => ({
  date: `Day ${i + 1}`,
  spend: Math.floor(Math.random() * 500) + 400 + (i * 20),
}));

const modelCostData = [
  { name: "GPT-4o", value: 14200 },
  { name: "Claude 3.5", value: 8500 },
  { name: "Gemini 1.5", value: 4300 },
  { name: "Claude 3 Haiku", value: 1200 },
];
const modelColors = ["#FF6B00", "#111111", "#A3A3A3", "#DCD5CD"];

const agentCostData = [
  { name: "Support Escalation Bot", spend: 14240 },
  { name: "Research Summarizer", spend: 8125 },
  { name: "Code Review Agent", spend: 6430 },
  { name: "Data Ingestion Agent", spend: 3200 },
  { name: "Sales Outreach Bot", spend: 2800 },
];

const tokenConsumptionData = Array.from({ length: 7 }).map((_, i) => ({
  day: `Day ${i + 1}`,
  prompt: Math.floor(Math.random() * 2000000) + 1000000,
  completion: Math.floor(Math.random() * 500000) + 200000,
}));

export default function AnalyticsPage() {
  return (
    <div className="p-10 max-w-[1600px] mx-auto space-y-8 bg-[#FAF7F3] min-h-screen text-[#111111] font-sans">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">Cost Analytics</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">Deep dive into your API spend, token consumption, and model utilization.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 bg-[#FFFFFF] border border-[#EEE8E2] px-3 py-2.5 rounded-md shadow-sm text-[13px] font-medium hover:border-[#DCD5CD] transition-colors">
            <Calendar className="h-4 w-4 text-[#888888]" />
            Last 30 Days
          </button>
          <button className="flex items-center gap-2 bg-[#FFFFFF] border border-[#EEE8E2] px-3 py-2.5 rounded-md shadow-sm text-[13px] font-medium hover:border-[#DCD5CD] transition-colors">
            <Filter className="h-4 w-4 text-[#888888]" />
            Filters
          </button>
          <button className="flex items-center gap-2 bg-[#111111] border border-[#111111] text-white px-4 py-2.5 rounded-md shadow-sm text-[13px] font-medium hover:bg-[#222222] transition-colors">
            <Download className="h-4 w-4" />
            Export CSV
          </button>
        </div>
      </header>

      {/* CHARTS GRID */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Spend Over Time */}
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm col-span-2">
          <h2 className="text-[16px] font-bold text-[#111111] mb-1">Spend Over Time</h2>
          <p className="text-[13px] text-[#888888] mb-6">Aggregate API cost across all environments and agents.</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={spendOverTimeData}>
                <defs>
                  <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF6B00" stopOpacity={0.1}/>
                    <stop offset="95%" stopColor="#FF6B00" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888888" }} dy={10} minTickGap={30} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888888" }} tickFormatter={(val) => `$${val}`} dx={-10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "500" }} 
                  itemStyle={{ color: "#FF6B00" }}
                />
                <Area type="monotone" dataKey="spend" stroke="#FF6B00" strokeWidth={3} fillOpacity={1} fill="url(#colorSpend)" activeDot={{ r: 6, fill: "#FF6B00", stroke: "#FFFFFF", strokeWidth: 2 }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost By Agent */}
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-[#111111] mb-1">Cost By Agent</h2>
          <p className="text-[13px] text-[#888888] mb-6">Top 5 highest spending autonomous agents.</p>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={agentCostData} layout="vertical" margin={{ left: 50 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#F0EBE6" />
                <XAxis type="number" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888888" }} tickFormatter={(val) => `$${val/1000}k`} />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#111111", fontWeight: 500 }} dx={-10} width={120} />
                <Tooltip 
                  cursor={{ fill: "#FAFAFA" }} 
                  contentStyle={{ backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "500" }} 
                />
                <Bar dataKey="spend" fill="#FF6B00" radius={[0, 4, 4, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cost By Model */}
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm">
          <h2 className="text-[16px] font-bold text-[#111111] mb-1">Cost By Model</h2>
          <p className="text-[13px] text-[#888888] mb-6">Distribution of spend across LLM providers.</p>
          <div className="h-[250px] w-full flex items-center justify-center">
            <div className="w-1/2 h-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={modelCostData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={2} dataKey="value" stroke="none">
                    {modelCostData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={modelColors[index % modelColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "500" }} 
                    itemStyle={{ color: "#FFFFFF" }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-1/2 space-y-4">
              {modelCostData.map((model, i) => (
                <div key={model.name} className="flex justify-between items-center text-[13px]">
                  <span className="flex items-center gap-2 font-medium text-[#111111]">
                    <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: modelColors[i % modelColors.length] }}></div>
                    {model.name}
                  </span>
                  <span className="font-bold text-[#111111]">${model.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Token Consumption */}
        <div className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl p-6 shadow-sm col-span-2">
          <h2 className="text-[16px] font-bold text-[#111111] mb-1">Token Consumption (Last 7 Days)</h2>
          <p className="text-[13px] text-[#888888] mb-6">Breakdown of prompt vs completion tokens processed by the Gateway.</p>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={tokenConsumptionData} stackOffset="sign">
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888888" }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: "#888888" }} tickFormatter={(val) => `${val/1000000}M`} dx={-10} />
                <Tooltip 
                  cursor={{ fill: "#FAFAFA" }} 
                  contentStyle={{ backgroundColor: "#111111", color: "#FFFFFF", borderRadius: "8px", border: "none", fontSize: "13px", fontWeight: "500" }} 
                />
                <Bar dataKey="prompt" name="Prompt Tokens" stackId="a" fill="#111111" radius={[0, 0, 4, 4]} maxBarSize={50} />
                <Bar dataKey="completion" name="Completion Tokens" stackId="a" fill="#FF6B00" radius={[4, 4, 0, 0]} maxBarSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
}
