import Link from "next/link";
import {
  Shield,
  CheckCircle,
  Brain,
  Lock,
  ArrowRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="bg-[#F7F3EE] min-h-screen">
      {/* NAVBAR */}

      <nav className="sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-8 py-6">
          <div className="bg-white/80 backdrop-blur-xl rounded-full px-8 py-4 shadow-lg flex items-center justify-between">
            <h1 className="font-bold text-2xl">
              WhoAI
            </h1>

            <div className="flex gap-8">
              <a href="#features">Features</a>
              <a href="#pricing">Pricing</a>
              <a href="#contact">Contact</a>
            </div>

            <Link
              href="/dashboard"
              className="bg-black text-white px-5 py-2 rounded-full"
            >
              Dashboard
            </Link>
          </div>
        </div>
      </nav>

      {/* HERO */}

      <section className="max-w-7xl mx-auto px-8 pt-20 pb-32">
        <div className="text-center">

          <div className="inline-flex px-4 py-2 rounded-full bg-white shadow mb-8">
            Runtime Governance Platform
          </div>

          <h1 className="text-7xl font-bold leading-tight max-w-5xl mx-auto">
            Runtime Governance
            <br />
            For Autonomous AI Agents
          </h1>

          <p className="text-xl text-gray-600 max-w-3xl mx-auto mt-8">
            Prevent unauthorized AI actions.
            Enforce policies, require approvals,
            and maintain complete audit trails
            before agents execute critical actions.
          </p>

          <div className="flex justify-center gap-4 mt-10">
            <Link
              href="/dashboard"
              className="bg-black text-white px-8 py-4 rounded-full flex items-center gap-2"
            >
              View Dashboard
              <ArrowRight size={18} />
            </Link>

            <button className="bg-white px-8 py-4 rounded-full shadow">
              Book Demo
            </button>
          </div>
        </div>
      </section>

      {/* GOVERNANCE FLOW */}

      <section className="max-w-7xl mx-auto px-8 mb-32">
        <div className="bg-white rounded-[40px] shadow-xl p-12">

          <h2 className="text-4xl font-bold text-center mb-16">
            Governance Flow
          </h2>

          <div className="grid md:grid-cols-5 gap-8">

            <div className="bg-slate-50 p-6 rounded-2xl">
              <Brain size={40} />
              <h3 className="font-bold mt-4">
                AI Agent
              </h3>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl">
              <Shield size={40} />
              <h3 className="font-bold mt-4">
                Policy Engine
              </h3>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl">
              <Lock size={40} />
              <h3 className="font-bold mt-4">
                Risk Detection
              </h3>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl">
              <CheckCircle size={40} />
              <h3 className="font-bold mt-4">
                Human Approval
              </h3>
            </div>

            <div className="bg-slate-50 p-6 rounded-2xl">
              <ArrowRight size={40} />
              <h3 className="font-bold mt-4">
                Execute
              </h3>
            </div>

          </div>
        </div>
      </section>

      {/* DASHBOARD PREVIEW */}

      <section className="max-w-7xl mx-auto px-8 mb-32">
        <h2 className="text-5xl font-bold text-center mb-12">
          Full Visibility Into Agent Decisions
        </h2>

        <div className="bg-white rounded-[40px] shadow-2xl p-8">
          <img
            src="/dashboard-preview.png"
            alt="WhoAI Dashboard"
            className="rounded-2xl"
          />
        </div>
      </section>

      {/* FEATURES */}

      <section
        id="features"
        className="max-w-7xl mx-auto px-8 mb-32"
      >
        <h2 className="text-5xl font-bold text-center mb-16">
          Enterprise AI Governance
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="text-2xl font-bold mb-4">
              Runtime Policies
            </h3>

            <p>
              Define governance rules for
              autonomous AI agents.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="text-2xl font-bold mb-4">
              Human-in-the-Loop
            </h3>

            <p>
              Require approval for
              high-risk decisions.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow">
            <h3 className="text-2xl font-bold mb-4">
              Audit Trails
            </h3>

            <p>
              Track every decision
              with full traceability.
            </p>
          </div>

        </div>
      </section>

      {/* METRICS */}

      <section className="max-w-7xl mx-auto px-8 mb-32">
        <div className="grid md:grid-cols-4 gap-8">

          <div className="text-center">
            <h3 className="text-6xl font-bold">
              1M+
            </h3>
            <p>Governed Decisions</p>
          </div>

          <div className="text-center">
            <h3 className="text-6xl font-bold">
              99.9%
            </h3>
            <p>Audit Coverage</p>
          </div>

          <div className="text-center">
            <h3 className="text-6xl font-bold">
              50ms
            </h3>
            <p>Policy Evaluation</p>
          </div>

          <div className="text-center">
            <h3 className="text-6xl font-bold">
              100%
            </h3>
            <p>Traceability</p>
          </div>

        </div>
      </section>

      {/* PRICING */}

      <section
        id="pricing"
        className="max-w-7xl mx-auto px-8 mb-32"
      >
        <h2 className="text-5xl font-bold text-center mb-16">
          Pricing
        </h2>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white p-8 rounded-3xl shadow">
            <h3 className="text-2xl font-bold">
              Starter
            </h3>

            <div className="text-5xl font-bold my-6">
              $99
            </div>
          </div>

          <div className="bg-black text-white p-8 rounded-3xl shadow">
            <h3 className="text-2xl font-bold">
              Growth
            </h3>

            <div className="text-5xl font-bold my-6">
              $499
            </div>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow">
            <h3 className="text-2xl font-bold">
              Enterprise
            </h3>

            <div className="text-5xl font-bold my-6">
              Custom
            </div>
          </div>

        </div>
      </section>

      {/* CTA */}

      <section className="pb-32">
        <div className="max-w-5xl mx-auto bg-black text-white rounded-[40px] p-16 text-center">
          <h2 className="text-5xl font-bold mb-6">
            Govern AI Before AI Governs You
          </h2>

          <Link
            href="/dashboard"
            className="inline-block mt-6 bg-white text-black px-8 py-4 rounded-full"
          >
            Start Now
          </Link>
        </div>
      </section>
    </div>
  );
}