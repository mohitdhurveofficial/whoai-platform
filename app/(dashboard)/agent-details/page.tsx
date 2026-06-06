"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { Bot, Clock, Activity, Settings, Shield, DollarSign } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function AgentDetailsPage() {
  const { id } = useParams();
  const [agent, setAgent] = useState<any>(null);
  const [activities, setActivities] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<"overview" | "logs" | "settings">("overview");
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    const [agentRes, activityRes] = await Promise.all([
      fetch(`/api/agents/${id}`),
      fetch(`/api/agents/${id}/activity`),
    ]);
    
    if (agentRes.ok) {
      const data = await agentRes.json();
      setAgent(data.agent || data);
    }
    if (activityRes.ok) {
      const data = await activityRes.json();
      setActivities(data.activities || data || []);
    }
  }, [id]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const updateStatus = async (status: string, reason: string) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/agents/${id}/status`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, reason }),
      });
      if (res.ok) {
        await fetchData();
      }
    } finally {
      setLoading(false);
    }
  };

  if (!agent) return <div className="p-10 animate-pulse text-gray-400 font-mono text-sm tracking-tighter">BOOTING_CONTROL_SURFACE...</div>;

  return (
    <div className="max-w-6xl mx-auto py-8 px-6">
      <div className="flex items-center justify-between mb-8 border-b border-black/5 pb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 bg-[#071126] rounded-xl flex items-center justify-center text-white">
            <Bot size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#071126] tracking-tight lowercase">agent::{agent.name}</h1>
            <p className="text-gray-400 font-mono text-[11px] uppercase tracking-widest">{agent.status} // {agent.id}</p>
          </div>
        </div>
        <div className="flex gap-3">
          {agent.status === "ACTIVE" ? (
            <button 
              onClick={() => updateStatus("PAUSED", "Manual Pause from Dashboard")}
              disabled={loading}
              className="px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg text-sm font-bold hover:bg-yellow-100 transition shadow-sm disabled:opacity-50"
            >
              Pause Agent
            </button>
          ) : (
            <button 
              onClick={() => updateStatus("ACTIVE", "Manual Resume from Dashboard")}
              disabled={loading || agent.status === "TERMINATED"}
              className="px-4 py-2 bg-green-50 text-green-600 rounded-lg text-sm font-bold hover:bg-green-100 transition shadow-sm disabled:opacity-50"
            >
              Resume Agent
            </button>
          )}
          <button 
            onClick={() => updateStatus("TERMINATED", "Emergency Stop from Dashboard")}
            disabled={loading || agent.status === "TERMINATED"}
            className="px-4 py-2 bg-red-50 text-red-600 rounded-lg text-sm font-bold hover:bg-red-100 transition disabled:opacity-50"
          >
            Emergency Stop
          </button>
        </div>
      </div>

      <nav className="flex gap-8 mb-8 text-xs font-black uppercase tracking-widest">
         <button onClick={() => setActiveTab('overview')} className={activeTab === 'overview' ? 'text-orange-600 border-b-2 border-orange-600 pb-4' : 'text-gray-400 pb-4'}>Overview</button>
         <button onClick={() => setActiveTab('logs')} className={activeTab === 'logs' ? 'text-orange-600 border-b-2 border-orange-600 pb-4' : 'text-gray-400 pb-4'}>Logs</button>
         <button onClick={() => setActiveTab('settings')} className={activeTab === 'settings' ? 'text-orange-600 border-b-2 border-orange-600 pb-4' : 'text-gray-400 pb-4'}>Settings</button>
      </nav>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 space-y-6">
            <section className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Shield size={12} /> System Instructions
              </h3>
              <div className="p-4 bg-[#fbf8f2] rounded-xl font-mono text-xs text-[#071126] leading-relaxed border border-orange-100/50">
                {agent.instructions || "NULL_INSTRUCTIONS"}
              </div>
            </section>

            <section className="bg-white p-6 rounded-2xl border border-black/5 shadow-sm">
              <h3 className="text-[11px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                <Activity size={12} /> Live Trace Stream
              </h3>
              <div className="space-y-3">
                {Array.isArray(activities) && activities.map((log) => (
                  <div key={log.id} className="flex items-center justify-between py-2 font-mono text-[11px] border-b border-black/5 last:border-0">
                    <span className="text-[#071126] font-bold">{log.action || log.event}</span>
                    <span className="text-gray-400">{log.createdAt ? formatDistanceToNow(new Date(log.createdAt)) : ''} ago</span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-[#071126] p-6 rounded-2xl text-white shadow-xl shadow-blue-900/10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] opacity-40 mb-4">Real-time Burn</p>
              <div className="flex items-end gap-2">
                 <h4 className="text-4xl font-black text-orange-500">${parseFloat(agent.currentMonthlySpend || 0).toFixed(2)}</h4>
                 <span className="text-[10px] mb-2 font-mono opacity-50">USD/MO</span>
              </div>
            </div>
          </aside>
        </div>
      )}
    </div>
  );
}