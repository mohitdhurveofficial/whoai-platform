"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  Building2,
  CheckCircle2,
  Fingerprint,
  KeyRound,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  TriangleAlert,
  UserRound,
} from "lucide-react";
import { Reveal, Stagger, StaggerItem, CountUp } from "../../components/marketing/Motion";

const workflowSteps = [
  { icon: Bot, label: "Agent request", tone: "bg-white text-[#071126]" },
  { icon: ShieldCheck, label: "Token metering", tone: "bg-white text-[#071126]" },
  { icon: TriangleAlert, label: "Budget check", tone: "bg-orange-100 text-orange-600" },
  { icon: UserRound, label: "Policy enforcement", tone: "bg-white text-[#071126]" },
  { icon: CheckCircle2, label: "Spend logged", tone: "bg-emerald-100 text-emerald-600" },
];

const trustItems = [
  { icon: BadgeCheck, label: "Enterprise Ready" },
  { icon: Lock, label: "Secure by Design" },
  { icon: Fingerprint, label: "Budget Controls" },
];

export default function SignupPage() {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    password: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setError("");

    if (!agreeToTerms) {
      setError("You must agree to the terms to continue");
      return;
    }

    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          password: formData.password,
          organizationName: formData.company,
        }),
      });

      const text = await res.text();

      let data: { error?: string; redirectTo?: string; user?: unknown } = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || "Signup failed");
      }

      // Signup already established a session cookie — go straight into the app
      // instead of bouncing the new user back to the login screen.
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      localStorage.setItem("is_authenticated", "true");

      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Signup failed. Please try again."
      );
      setIsLoading(false);
    }
  };

  return (
    <main className="texture min-h-screen overflow-hidden px-4 py-6 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-48px)] w-full max-w-[1180px] flex-col">
        <header className="flex items-center justify-between gap-4 py-2">
          <Link href="/" className="flex items-center gap-3">
            <span className="shield-logo h-11 w-9 bg-[#071126]" />
            <span className="text-[30px] font-black leading-none text-[#071126]">
              WHOAI
            </span>
          </Link>

          <Link
            href="/"
            className="shadow-button-light inline-flex h-11 items-center justify-center rounded-full border border-black/6 bg-white px-5 text-[13px] font-bold text-[#071126] transition hover:-translate-y-0.5"
          >
            Back home
          </Link>
        </header>

        <section className="grid flex-1 items-center gap-8 py-8 lg:grid-cols-[minmax(0,0.92fr)_minmax(460px,1fr)] lg:py-10">
          <Stagger className="relative z-10 mx-auto w-full max-w-[438px] lg:mx-0" stagger={0.1}>
            <StaggerItem className="mb-7">
              <div className="inline-flex h-8 items-center gap-2 rounded-full border border-black/5 bg-white px-3 text-[13px] font-semibold text-[#071126] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.12)]" />
                AI FinOps &amp; Governance Control Plane
              </div>

              <h1 className="mt-6 text-[38px] font-black leading-[1.06] text-[#071126] sm:text-[46px]">
                Create your
                <br />
                <span className="orange-gradient">WHOAI workspace</span>
              </h1>
              <p className="mt-5 max-w-[390px] text-[15px] font-medium leading-7 text-[#071126]/78">
                Track tokens, enforce budgets, and stop runaway AI spend — start governing every AI agent in minutes.
              </p>
            </StaggerItem>

            <StaggerItem>
            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
                {error}
              </div>
            )}

            <form
              onSubmit={handleSubmit}
              className="premium-panel rounded-[18px] bg-white/88 p-5 shadow-[0_22px_60px_rgba(7,17,38,0.11)] sm:p-6"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="fullName" className="mb-2 block text-[13px] font-bold text-[#071126]">
                    Full name
                  </label>
                  <div className="relative">
                    <UserRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#071126]/38" size={18} />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      value={formData.fullName}
                      onChange={handleChange}
                      placeholder="Jane Smith"
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-black/8 bg-white pl-11 pr-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="mb-2 block text-[13px] font-bold text-[#071126]">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#071126]/38" size={18} />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="jane@company.com"
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-black/8 bg-white pl-11 pr-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="company" className="mb-2 block text-[13px] font-bold text-[#071126]">
                    Organization name
                  </label>
                  <div className="relative">
                    <Building2 className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#071126]/38" size={18} />
                    <input
                      id="company"
                      name="company"
                      type="text"
                      value={formData.company}
                      onChange={handleChange}
                      placeholder="Your Company Inc."
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-black/8 bg-white pl-11 pr-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="password" className="mb-2 block text-[13px] font-bold text-[#071126]">
                    Password
                  </label>
                  <div className="relative">
                    <KeyRound className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#071126]/38" size={18} />
                    <input
                      id="password"
                      name="password"
                      type="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-black/8 bg-white pl-11 pr-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-bold text-[#071126]">
                    Confirm password
                  </label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#071126]/38" size={18} />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="••••••••"
                      required
                      minLength={8}
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-black/8 bg-white pl-11 pr-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </div>

              <label className="mt-4 flex items-start gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeToTerms}
                  onChange={(e) => setAgreeToTerms(e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-black/15 text-orange-600 focus:ring-orange-500"
                />
                <span className="text-[13px] font-semibold text-[#071126]/74">
                  I agree to the{" "}
                  <Link href="/terms" className="font-bold text-orange-600 hover:text-orange-700">
                    Terms of Service
                  </Link>
                  {" "}and{" "}
                  <Link href="/privacy" className="font-bold text-orange-600 hover:text-orange-700">
                    Privacy Policy
                  </Link>
                </span>
              </label>

              <button
                type="submit"
                disabled={isLoading || !agreeToTerms}
                className="shadow-button-dark mt-6 flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#071126] px-6 text-[14px] font-bold text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                aria-label="Create your workspace"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin text-orange-400" size={18} />
                    Creating account
                  </>
                ) : (
                  <>
                    Create account
                    <ArrowRight size={18} className="text-orange-500" />
                  </>
                )}
              </button>
            </form>

            <p className="mt-5 text-center text-[14px] font-medium text-[#071126]/72">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-black text-orange-600 hover:text-orange-700">
                Sign in
              </Link>
            </p>
            </StaggerItem>
          </Stagger>

          <div className="relative hidden min-h-[560px] lg:block">
            <div className="hero-shield left-[54%] top-3 opacity-[0.16]" />
            <div className="dot-field absolute right-4 top-6 h-48 w-56 opacity-55" />
            <div className="dot-field absolute bottom-12 left-6 h-36 w-48 opacity-45" />

            <Reveal x={40} delay={0.15} className="premium-panel absolute right-0 top-2 w-[520px] overflow-hidden rounded-[18px] bg-white/86 shadow-[0_28px_72px_rgba(7,17,38,0.13)]">
              <div className="dark-pattern px-7 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="!text-white/60 text-[12px] font-bold uppercase tracking-[0.16em]">
                      AI FinOps
                    </p>
                    <h2 className="mt-2 !text-white text-[24px] font-black tracking-[-0.03em]">
                      WHOAI Control Plane
                    </h2>
                  </div>
                  <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-orange-300">
                    <ShieldCheck size={25} />
                  </span>
                </div>
              </div>

              <div className="grid gap-4 p-6">
                <div className="grid grid-cols-3 gap-3">
                  {trustItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.label} className="min-h-[94px] rounded-[14px] border border-black/5 bg-white p-4 shadow-sm">
                        <Icon size={20} className="text-orange-500" />
                        <p className="mt-4 text-[12px] font-black leading-snug text-[#071126]">
                          {item.label}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="rounded-[15px] border border-black/5 bg-[#fbf8f2] p-5">
                  <div className="mb-4 flex items-center justify-between">
                    <div>
                      <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#071126]/42">
                        Gateway Request
                      </p>
                      <p className="mt-1 text-[16px] font-black text-[#071126]">
                        Token metering &amp; budget enforcement
                      </p>
                    </div>
                    <span className="rounded-full bg-orange-100 px-3 py-1 text-[11px] font-black text-orange-700">
                      Review
                    </span>
                  </div>

                  <div className="space-y-3">
                    {workflowSteps.map((step, index) => {
                      const Icon = step.icon;

                      return (
                        <div key={step.label} className="flex min-h-[54px] items-center gap-4 rounded-xl border border-black/5 bg-white px-4 shadow-sm">
                          <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${step.tone}`}>
                            <Icon size={18} />
                          </span>
                          <div className="min-w-0 flex-1">
                            <p className="text-[13px] font-black text-[#071126]">{step.label}</p>
                            <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-black/5">
                              <div
                                className={`h-full rounded-full ${index < 3 ? "bg-orange-500" : "bg-emerald-500"}`}
                                style={{ width: `${44 + index * 11}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </Reveal>

            <Reveal x={-40} delay={0.35} className="premium-panel absolute bottom-5 left-0 w-[260px] rounded-[16px] bg-white/90 p-5 shadow-[0_20px_56px_rgba(7,17,38,0.12)]">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#071126]/42">
                  Monthly Budget Used
                </p>
                <span className="rounded-full bg-black/5 px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] text-[#071126]/45">
                  Sample data
                </span>
              </div>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-[42px] font-black leading-none text-[#071126]">
                  <CountUp value={74} suffix="%" />
                </span>
                <span className="mb-1 rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-black text-orange-700">
                  $740 / $1k
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/6">
                <div className="h-full w-[74%] rounded-full bg-orange-500" />
              </div>
            </Reveal>
          </div>
        </section>
      </div>
    </main>
  );
}
