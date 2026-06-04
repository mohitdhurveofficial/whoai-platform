"use client";

import React from "react";
import Link from "next/link";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Bot,
  Box,
  ChevronRight,
  DollarSign,
  Fingerprint,
  LineChart as LineChartIcon,
  ShieldAlert,
  TrendingUp,
  Zap,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

// --- MOCK DATA FOR CHARTS ---

const mockSpendData = [
  { name: "1", spend: 420 },
  { name: "2", spend: 480 },
  { name: "3", spend: 450 },
  { name: "4", spend: 580 },
  { name: "5", spend: 610 },
  { name: "6", spend: 590 },
  { name: "7", spend: 780 },
  { name: "8", spend: 810 },
  { name: "9", spend: 850 },
  { name: "10", spend: 920 },
  { name: "11", spend: 1100 },
  { name: "12", spend: 1050 },
  { name: "13", spend: 1250 },
  { name: "14", spend: 1400 },
];

const mockModelData = [
  { name: "GPT-4o", spend: 1420 },
  { name: "Claude 3.5", spend: 850 },
  { name: "Gemini 1.5", spend: 430 },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#FAF7F3] text-[#111111] font-sans selection:bg-[#FF6B00] selection:text-white relative overflow-hidden">
      {/* Background Texture Overlay */}
      <div className="absolute inset-0 pointer-events-none dot-field opacity-60 z-0"></div>
      <div className="absolute inset-0 pointer-events-none bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-white/60 via-[#FAF7F3]/40 to-[#FAF7F3] z-0"></div>

      
      {/* NAVIGATION */}
      <nav className="sticky top-0 z-50 bg-[#FAF7F3]/90 backdrop-blur-md border-b border-[#EEE8E2]">
        <div className="max-w-[1200px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-10">
            <Link href="/" className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded bg-[#FF6B00] text-sm font-bold text-white shadow-sm">
                W
              </div>
              <span className="text-[17px] font-bold tracking-tight">WHOAI</span>
            </Link>
            <div className="hidden md:flex items-center gap-8 text-[14px] font-medium text-[#666666]">
              <Link href="#" className="hover:text-[#111111] transition-colors">Product</Link>
              <Link href="#" className="hover:text-[#111111] transition-colors">Solutions</Link>
              <Link href="#" className="hover:text-[#111111] transition-colors">Pricing</Link>
              <Link href="#" className="hover:text-[#111111] transition-colors">Docs</Link>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-[14px] font-medium text-[#111111] hover:text-[#FF6B00] transition-colors hidden md:block">
              Sign In
            </Link>
            <Link href="/dashboard" className="bg-[#FFFFFF] border border-[#EEE8E2] text-[#111111] px-4 py-2.5 rounded-md font-medium text-[14px] shadow-sm hover:border-[#DCD5CD] transition-colors">
              Book Demo
            </Link>
            <Link href="/signup" className="bg-[#FF6B00] text-white px-4 py-2.5 rounded-md font-medium text-[14px] hover:bg-[#E65A00] transition-colors shadow-sm">
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="relative z-10 pt-32 pb-24 px-6 text-center max-w-[900px] mx-auto">
        <h1 className="text-[56px] leading-[1.05] md:text-[72px] font-extrabold tracking-tight text-[#111111] mb-8">
          Control Every Dollar <br className="hidden md:block" />
          Your AI Agents Spend
        </h1>
        <p className="text-[18px] md:text-[21px] text-[#666666] mb-12 max-w-[700px] mx-auto leading-relaxed">
          Track token usage, monitor AI agents, detect cost anomalies, and stop runaway API bills before they impact your business.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
          <Link href="/signup" className="w-full sm:w-auto bg-[#FF6B00] text-white px-8 py-4 rounded-md font-semibold text-[16px] hover:bg-[#E65A00] transition-colors shadow-md flex items-center justify-center gap-2">
            Start Free Trial <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/demo" className="w-full sm:w-auto bg-[#FFFFFF] border border-[#EEE8E2] text-[#111111] px-8 py-4 rounded-md font-semibold text-[16px] shadow-sm hover:border-[#DCD5CD] transition-colors flex items-center justify-center">
            Book Demo
          </Link>
        </div>

        {/* TRUST BADGES */}
        <p className="text-[12px] font-semibold tracking-widest text-[#888888] uppercase mb-6">Trusted infrastructure for modern AI teams</p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 text-[#888888] font-bold text-[18px] grayscale opacity-60">
          <span className="flex items-center gap-2"><Box className="h-5 w-5" /> OpenAI</span>
          <span className="flex items-center gap-2"><Fingerprint className="h-5 w-5" /> Anthropic</span>
          <span className="flex items-center gap-2"><Zap className="h-5 w-5" /> Google Gemini</span>
          <span className="flex items-center gap-2"><Bot className="h-5 w-5" /> Azure</span>
          <span className="flex items-center gap-2"><Activity className="h-5 w-5" /> AWS</span>
        </div>
      </section>

      {/* HERO VISUAL: DASHBOARD MOCKUP */}
      <section className="relative z-10 max-w-[1200px] mx-auto px-6 mb-40">
        <div className="rounded-xl border border-[#EEE8E2] bg-[#FFFFFF] shadow-2xl shadow-black/5 overflow-hidden">
          {/* Browser Chrome */}
          <div className="h-12 border-b border-[#EEE8E2] bg-[#FAFAFA] flex items-center px-4 gap-2">
            <div className="w-3 h-3 rounded-full bg-[#E5E5E5]"></div>
            <div className="w-3 h-3 rounded-full bg-[#E5E5E5]"></div>
            <div className="w-3 h-3 rounded-full bg-[#E5E5E5]"></div>
            <div className="mx-auto bg-[#FFFFFF] border border-[#EEE8E2] rounded flex items-center justify-center h-6 px-32 text-[11px] text-[#A3A3A3] font-medium font-mono">
              app.whoai.ai/dashboard
            </div>
          </div>
          
          {/* Dashboard Inside */}
          <div className="p-8 bg-[#FAF7F3]">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-[20px] font-bold">Executive Overview</h3>
              <div className="flex gap-2">
                <span className="bg-[#FFFFFF] border border-[#EEE8E2] px-3 py-1.5 text-[12px] font-medium rounded shadow-sm">30 Days</span>
                <span className="bg-[#111111] text-[#FFFFFF] px-3 py-1.5 text-[12px] font-medium rounded shadow-sm">Export</span>
              </div>
            </div>

            {/* KPI Row */}
            <div className="grid grid-cols-4 gap-4 mb-6">
              <div className="bg-[#FFFFFF] border border-[#EEE8E2] p-4 rounded-lg shadow-sm">
                <p className="text-[12px] font-semibold text-[#888888] uppercase mb-2">Total AI Spend</p>
                <p className="text-[24px] font-bold text-[#111111]">$42,842.10</p>
                <p className="text-[12px] text-[#047857] font-medium mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> +14.2%</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#EEE8E2] p-4 rounded-lg shadow-sm">
                <p className="text-[12px] font-semibold text-[#888888] uppercase mb-2">Active Agents</p>
                <p className="text-[24px] font-bold text-[#111111]">124</p>
                <p className="text-[12px] text-[#047857] font-medium mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> +12</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#EEE8E2] p-4 rounded-lg shadow-sm">
                <p className="text-[12px] font-semibold text-[#888888] uppercase mb-2">Tokens Processed</p>
                <p className="text-[24px] font-bold text-[#111111]">1.2B</p>
                <p className="text-[12px] text-[#047857] font-medium mt-1 flex items-center gap-1"><TrendingUp className="h-3 w-3"/> +8.4%</p>
              </div>
              <div className="bg-[#FFFFFF] border border-[#EEE8E2] p-4 rounded-lg shadow-sm border-l-2 border-l-[#DC2626]">
                <p className="text-[12px] font-semibold text-[#888888] uppercase mb-2">Cost Alerts</p>
                <p className="text-[24px] font-bold text-[#DC2626]">3</p>
                <p className="text-[12px] text-[#DC2626] font-medium mt-1">Require attention</p>
              </div>
            </div>

            {/* Chart Row */}
            <div className="grid grid-cols-3 gap-6">
              <div className="col-span-2 bg-[#FFFFFF] border border-[#EEE8E2] p-5 rounded-lg shadow-sm">
                <h4 className="text-[14px] font-bold mb-4">Spend Velocity (Last 14 Days)</h4>
                <div className="h-[200px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={mockSpendData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F0EBE6" />
                      <XAxis dataKey="name" hide />
                      <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#A3A3A3" }} tickFormatter={(val) => `$${val}`} />
                      <Line type="monotone" dataKey="spend" stroke="#FF6B00" strokeWidth={3} dot={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="col-span-1 bg-[#FFFFFF] border border-[#EEE8E2] p-5 rounded-lg shadow-sm">
                <h4 className="text-[14px] font-bold mb-4">Top Spending Agents</h4>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[13px] font-bold">Support Escalation Bot</p>
                      <p className="text-[11px] text-[#888888]">GPT-4o</p>
                    </div>
                    <p className="text-[13px] font-bold text-[#111111]">$14,240</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[13px] font-bold">Research Summarizer</p>
                      <p className="text-[11px] text-[#888888]">Claude 3.5 Sonnet</p>
                    </div>
                    <p className="text-[13px] font-bold text-[#111111]">$8,125</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-[13px] font-bold">Code Review Agent</p>
                      <p className="text-[11px] text-[#888888]">Claude 3 Opus</p>
                    </div>
                    <p className="text-[13px] font-bold text-[#111111]">$6,430</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PROBLEM SECTION */}
      <section className="relative z-10 py-32 bg-[#FFFFFF] border-y border-[#EEE8E2]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center max-w-[800px] mx-auto mb-20">
            <h2 className="text-[40px] font-bold tracking-tight text-[#111111] mb-4">AI Costs Are Growing Faster<br/>Than Teams Can Track</h2>
            <p className="text-[18px] text-[#666666]">Legacy billing dashboards don&apos;t work for autonomous AI. You need real-time, agent-level visibility before the bill arrives.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-[#FAF7F3] p-8 rounded-xl border border-[#EEE8E2]">
              <div className="w-12 h-12 bg-[#FFFFFF] rounded-lg shadow-sm border border-[#EEE8E2] flex items-center justify-center text-[#FF6B00] mb-6">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="text-[20px] font-bold mb-3">Runaway Agents</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">
                Autonomous agents can get stuck in loops, burning thousands of tokens per minute without any human oversight or control.
              </p>
            </div>
            <div className="bg-[#FAF7F3] p-8 rounded-xl border border-[#EEE8E2]">
              <div className="w-12 h-12 bg-[#FFFFFF] rounded-lg shadow-sm border border-[#EEE8E2] flex items-center justify-center text-[#FF6B00] mb-6">
                <TrendingUp className="h-6 w-6" />
              </div>
              <h3 className="text-[20px] font-bold mb-3">Unexpected Token Spikes</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">
                A single complex prompt or bloated context window can spike costs by 400% in an hour. Finding the source takes days.
              </p>
            </div>
            <div className="bg-[#FAF7F3] p-8 rounded-xl border border-[#EEE8E2]">
              <div className="w-12 h-12 bg-[#FFFFFF] rounded-lg shadow-sm border border-[#EEE8E2] flex items-center justify-center text-[#FF6B00] mb-6">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <h3 className="text-[20px] font-bold mb-3">Budget Overruns</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">
                By the time the cloud bill arrives at the end of the month, the damage is done. You can&apos;t manage what you can&apos;t measure in real time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="relative z-10 py-32 bg-[#FAF7F3]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="mb-20">
            <h2 className="text-[40px] font-bold tracking-tight text-[#111111] mb-4">Everything You Need To Control AI Spend</h2>
            <p className="text-[18px] text-[#666666] max-w-[600px]">A complete FinOps operating system built from the ground up for the autonomous AI era.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-x-8 gap-y-12">
            <div>
              <div className="mb-4 text-[#FF6B00]"><BarChart3 className="h-8 w-8" strokeWidth={1.5} /></div>
              <h3 className="text-[18px] font-bold mb-2">AI Cost Monitoring</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">Instantly visualize your daily, weekly, and monthly AI API spend across all providers in one unified dashboard.</p>
            </div>
            <div>
              <div className="mb-4 text-[#FF6B00]"><Fingerprint className="h-8 w-8" strokeWidth={1.5} /></div>
              <h3 className="text-[18px] font-bold mb-2">Token Tracking</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">Meter exactly how many prompt and completion tokens are being burned per request, per user, and per agent.</p>
            </div>
            <div>
              <div className="mb-4 text-[#FF6B00]"><Activity className="h-8 w-8" strokeWidth={1.5} /></div>
              <h3 className="text-[18px] font-bold mb-2">Agent Analytics</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">See which autonomous workflows are driving the most value and which are wasting expensive compute cycles.</p>
            </div>
            <div>
              <div className="mb-4 text-[#FF6B00]"><ShieldAlert className="h-8 w-8" strokeWidth={1.5} /></div>
              <h3 className="text-[18px] font-bold mb-2">Budget Controls</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">Set hard daily and monthly spend limits. Automatically engage the kill switch if an agent exceeds its allowed budget.</p>
            </div>
            <div>
              <div className="mb-4 text-[#FF6B00]"><Zap className="h-8 w-8" strokeWidth={1.5} /></div>
              <h3 className="text-[18px] font-bold mb-2">Real-Time Alerts</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">Get instantly notified in Slack or Teams when an anomaly is detected, like a 400% spike in token burn rate.</p>
            </div>
            <div>
              <div className="mb-4 text-[#FF6B00]"><LineChartIcon className="h-8 w-8" strokeWidth={1.5} /></div>
              <h3 className="text-[18px] font-bold mb-2">Cost Optimization</h3>
              <p className="text-[15px] text-[#666666] leading-relaxed">Identify duplicate prompts, cache frequent queries, and route requests to cheaper models to reduce spend by up to 30%.</p>
            </div>
          </div>
        </div>
      </section>

      {/* DASHBOARD SHOWCASE 2 */}
      <section className="relative z-10 py-24 bg-[#111111] text-[#FFFFFF] overflow-hidden">
        <div className="max-w-[1200px] mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
          <div className="lg:w-1/2">
            <h2 className="text-[36px] font-bold tracking-tight mb-6">Stop shadow AI in its tracks.</h2>
            <p className="text-[18px] text-[#A3A3A3] mb-8 leading-relaxed">
              WHOAI acts as a high-performance gateway between your agents and LLM providers. We intercept, track, and evaluate every request before it costs you money.
            </p>
            <ul className="space-y-5">
              <li className="flex items-start gap-3 text-[16px] text-[#D4D4D4]">
                <div className="mt-1 bg-[#FF6B00]/20 text-[#FF6B00] rounded-full p-1"><ChevronRight className="h-3 w-3" /></div>
                Zero-latency AI Gateway proxy
              </li>
              <li className="flex items-start gap-3 text-[16px] text-[#D4D4D4]">
                <div className="mt-1 bg-[#FF6B00]/20 text-[#FF6B00] rounded-full p-1"><ChevronRight className="h-3 w-3" /></div>
                Multi-tenant organization RBAC
              </li>
              <li className="flex items-start gap-3 text-[16px] text-[#D4D4D4]">
                <div className="mt-1 bg-[#FF6B00]/20 text-[#FF6B00] rounded-full p-1"><ChevronRight className="h-3 w-3" /></div>
                VPC self-hosting available
              </li>
            </ul>
          </div>
          <div className="lg:w-1/2 relative w-full">
            {/* Minimal Dark Mockup */}
            <div className="w-full bg-[#1A1A1A] border border-[#333333] rounded-xl shadow-2xl p-6">
              <h4 className="text-[14px] font-bold text-[#FFFFFF] mb-4">Live Token Telemetry</h4>
              <div className="space-y-3">
                <div className="flex justify-between items-center bg-[#222222] p-3 rounded border border-[#333333]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#047857]"></div>
                    <span className="text-[13px] font-mono text-[#D4D4D4]">req_7x9a...</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#FF6B00]">+2,401 tokens</span>
                </div>
                <div className="flex justify-between items-center bg-[#222222] p-3 rounded border border-[#333333]">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#047857]"></div>
                    <span className="text-[13px] font-mono text-[#D4D4D4]">req_8y2b...</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#FF6B00]">+842 tokens</span>
                </div>
                <div className="flex justify-between items-center bg-[#331111] p-3 rounded border border-[#FF0000]/30">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-[#DC2626]"></div>
                    <span className="text-[13px] font-mono text-[#D4D4D4]">req_9z1c...</span>
                  </div>
                  <span className="text-[13px] font-mono text-[#DC2626]">BLOCKED (BUDGET)</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* BENEFITS */}
      <section className="relative z-10 py-32 bg-[#FFFFFF]">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 text-center">
            <div>
              <h3 className="text-[48px] font-extrabold text-[#111111] mb-2">15-30%</h3>
              <p className="text-[18px] font-bold mb-4">Reduce AI Spend</p>
              <p className="text-[15px] text-[#666666]">Instantly cut wasted compute by identifying duplicate prompts and inefficient agent loops.</p>
            </div>
            <div>
              <h3 className="text-[48px] font-extrabold text-[#111111] mb-2">$0</h3>
              <p className="text-[18px] font-bold mb-4">Prevent Cost Surprises</p>
              <p className="text-[15px] text-[#666666]">Hard budget limits ensure you never wake up to an unexpected six-figure OpenAI bill.</p>
            </div>
            <div>
              <h3 className="text-[48px] font-extrabold text-[#111111] mb-2">10x</h3>
              <p className="text-[18px] font-bold mb-4">Scale AI Safely</p>
              <p className="text-[15px] text-[#666666]">Deploy autonomous agents across your enterprise with absolute financial confidence.</p>
            </div>
          </div>
        </div>
      </section>

      {/* SOCIAL PROOF */}
      <section className="relative z-10 py-24 bg-[#FAF7F3] border-y border-[#EEE8E2]">
        <div className="max-w-[1200px] mx-auto px-6 text-center">
          <p className="text-[14px] font-bold tracking-widest text-[#FF6B00] uppercase mb-8">Platform Scale</p>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="p-8">
              <p className="text-[40px] font-bold text-[#111111] tracking-tight">$18M+</p>
              <p className="text-[14px] font-semibold text-[#888888] uppercase mt-2">AI Spend Tracked</p>
            </div>
            <div className="p-8 border-x border-[#EEE8E2]">
              <p className="text-[40px] font-bold text-[#111111] tracking-tight">250M+</p>
              <p className="text-[14px] font-semibold text-[#888888] uppercase mt-2">Tokens Monitored</p>
            </div>
            <div className="p-8">
              <p className="text-[40px] font-bold text-[#111111] tracking-tight">99.99%</p>
              <p className="text-[14px] font-semibold text-[#888888] uppercase mt-2">Gateway Uptime</p>
            </div>
          </div>
        </div>
      </section>

      {/* FINAL CTA */}
      <section className="relative z-10 py-32 bg-[#FFFFFF]">
        <div className="max-w-[800px] mx-auto px-6 text-center">
          <h2 className="text-[48px] font-extrabold tracking-tight text-[#111111] mb-6">
            Stop Guessing Where Your <br/> AI Budget Goes
          </h2>
          <p className="text-[20px] text-[#666666] mb-12">
            Get complete visibility into every AI request, token, and dollar spent. Set up WHOAI in 5 minutes.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="w-full sm:w-auto bg-[#FF6B00] text-white px-8 py-4 rounded-md font-semibold text-[16px] hover:bg-[#E65A00] transition-colors shadow-md">
              Start Free Trial
            </Link>
            <Link href="/demo" className="w-full sm:w-auto bg-[#FFFFFF] border border-[#EEE8E2] text-[#111111] px-8 py-4 rounded-md font-semibold text-[16px] shadow-sm hover:border-[#DCD5CD] transition-colors">
              Book Demo
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="relative z-10 bg-[#FAF7F3] border-t border-[#EEE8E2] py-16">
        <div className="max-w-[1200px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-6">
              <div className="flex h-6 w-6 items-center justify-center rounded bg-[#FF6B00] text-[10px] font-bold text-white shadow-sm">
                W
              </div>
              <span className="text-[15px] font-bold tracking-tight">WHOAI</span>
            </Link>
            <p className="text-[14px] text-[#888888] max-w-[250px]">
              The FinOps control plane for the autonomous AI era. Track tokens, enforce budgets, and stop runaway spend.
            </p>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#111111] mb-4 uppercase tracking-wider">Product</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">AI Gateway</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Cost Analytics</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Budget Controls</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Alerting</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#111111] mb-4 uppercase tracking-wider">Resources</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Documentation</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">API Reference</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Blog</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Security</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[13px] font-bold text-[#111111] mb-4 uppercase tracking-wider">Company</h4>
            <ul className="space-y-3">
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">About</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Customers</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Contact</Link></li>
              <li><Link href="#" className="text-[14px] text-[#666666] hover:text-[#FF6B00] transition-colors">Terms of Service</Link></li>
            </ul>
          </div>
        </div>
        <div className="max-w-[1200px] mx-auto px-6 mt-16 pt-8 border-t border-[#EEE8E2] flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-[13px] text-[#888888]">© 2026 WHOAI Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="#" className="text-[13px] text-[#888888] hover:text-[#111111]">Privacy</Link>
            <Link href="#" className="text-[13px] text-[#888888] hover:text-[#111111]">Terms</Link>
            <Link href="#" className="text-[13px] text-[#888888] hover:text-[#111111]">Status</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
