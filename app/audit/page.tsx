import Link from "next/link";
import { ShieldCheck, Search, DollarSign, Users, ArrowRight, BellRing } from "lucide-react";

export const metadata = {
  title: "AI Cost Leak Audit | WHOAI",
  description: "We identify wasted spend, runaway agents, duplicate prompts, and optimization opportunities. If we don't find meaningful savings, don't buy.",
};

export default function PilotLandingPage() {
  return (
    <main className="min-h-screen bg-slate-50 font-sans selection:bg-blue-200">
      {/* Navigation */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-6xl mx-auto">
        <div className="font-bold text-2xl tracking-tight text-slate-900">WHOAI</div>
        <a href="mailto:founder@whoai.ai" className="text-sm font-semibold text-slate-600 hover:text-slate-900 transition">
          Contact
        </a>
      </nav>

      {/* Hero Section */}
      <section className="px-8 pt-20 pb-16 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-bold tracking-wide uppercase mb-6">
          <Search size={16} /> AI Cost Leak Audit
        </div>
        <h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight mb-6">
          See, control, and reduce AI spending before <span className="text-blue-600">runaway agents become runaway costs.</span>
        </h1>
        <p className="text-xl text-slate-600 mb-10 leading-relaxed max-w-3xl mx-auto">
          We identify wasted spend, runaway agents, duplicate prompts, and optimization opportunities. If we don&apos;t find meaningful savings, don&apos;t buy.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          {/* Replace href with your actual Calendly / booking link */}
          <a href="https://calendly.com/your-booking-link" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-slate-900 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-800 transition shadow-lg shadow-slate-900/20 w-full sm:w-auto justify-center">
            Start Your Cost Leak Audit <ArrowRight size={20} />
          </a>
          <span className="text-sm font-medium text-slate-500">Starts at $2,000/month SaaS</span>
        </div>
      </section>

      {/* Deliverables Section */}
      <section className="px-8 py-20 max-w-6xl mx-auto border-t border-slate-200">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 mb-4">Infrastructure, Not Productivity</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">Route your traffic through our Cloud Gateway (or self-host in your VPC). We handle the rest.</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-blue-50 text-blue-600 flex items-center justify-center rounded-xl mb-6">
              <DollarSign size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-3">Reduce AI Spend 15-30%</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Stop paying for duplicate prompts and inefficient agent loops. We identify and trim the fat.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-600 flex items-center justify-center rounded-xl mb-6">
              <Users size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-3">Find Exactly Who Owns The Spend</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Stop unknown AI workloads from running without ownership. Map every API call to a team and project.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-violet-50 text-violet-600 flex items-center justify-center rounded-xl mb-6">
              <BellRing size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-3">AI Cost Anomaly Detection</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Get instant Slack alerts when an agent&apos;s spend increases by 400% in 45 minutes.</p>
          </div>

          <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 flex items-center justify-center rounded-xl mb-6">
              <ShieldCheck size={24} />
            </div>
            <h3 className="font-bold text-lg text-slate-900 mb-3">The Kill Switch</h3>
            <p className="text-slate-600 text-sm leading-relaxed">Instantly suspend runaway AI agents from draining your corporate card with a single click.</p>
          </div>
        </div>
      </section>
      
      {/* Bottom CTA */}
      <section className="bg-slate-900 py-20 px-8 text-center mt-10">
        <h2 className="text-3xl font-bold text-white mb-6">Take control of your AI API spend today.</h2>
        <a href="https://calendly.com/your-booking-link" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 bg-white text-slate-900 px-8 py-4 rounded-xl font-bold text-lg hover:bg-slate-100 transition shadow-lg w-full sm:w-auto justify-center">
          Book Your Assessment
        </a>
      </section>
    </main>
  );
}