"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BadgeCheck,
  Bot,
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

const workflowSteps = [
  { icon: Bot, label: "AI Employee", tone: "bg-white text-[#071126]" },
  { icon: ShieldCheck, label: "Task Analysis", tone: "bg-white text-[#071126]" },
  { icon: TriangleAlert, label: "Execution Review", tone: "bg-orange-100 text-orange-600" },
  { icon: UserRound, label: "Human Oversight", tone: "bg-white text-[#071126]" },
  { icon: CheckCircle2, label: "Task Completed", tone: "bg-emerald-100 text-emerald-600" },
];

const trustItems = [
  { icon: BadgeCheck, label: "Enterprise Ready" },
  { icon: Lock, label: "Secure by Design" },
  { icon: Fingerprint, label: "Multi-Agent Control" },
];

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/ai-workers/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const text = await res.text();

      let data: any = {};

      try {
        data = text ? JSON.parse(text) : {};
      } catch {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data?.error || "Login failed");
      }

      if (!data?.token) {
        throw new Error("Token not received");
      }

      // Set the cookie expected by middleware and lib/auth.ts
      document.cookie = `whoai_auth=${data.token}; path=/; max-age=86400; SameSite=Lax`;
      localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("is_authenticated", "true");

      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Authentication failed"
      );
    } finally {
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
              WhoAI
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
          <div className="relative z-10 mx-auto w-full max-w-[438px] lg:mx-0">
            <div className="mb-7">
              <div className="inline-flex h-8 items-center gap-2 rounded-full border border-black/5 bg-white px-3 text-[13px] font-semibold text-[#071126] shadow-sm">
                <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.12)]" />
                AI Workforce Command Center
              </div>

              <h1 className="mt-6 text-[38px] font-black leading-[1.06] text-[#071126] sm:text-[46px]">
                Sign in to the
                <br />
                <span className="orange-gradient">WHOAI Platform</span>
              </h1>
              <p className="mt-5 max-w-[390px] text-[15px] font-medium leading-7 text-[#071126]/78">
                Manage AI employees, monitor performance, control costs, and scale your digital workforce from one platform.
              </p>
            </div>

            {error && (
              <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700" role="alert">
                {error}
              </div>
            )}

            <form
              onSubmit={handleLogin}
              className="premium-panel rounded-[18px] bg-white/88 p-5 shadow-[0_22px_60px_rgba(7,17,38,0.11)] sm:p-6"
            >
              <div className="space-y-4">
                <div>
                  <label htmlFor="email" className="mb-2 block text-[13px] font-bold text-[#071126]">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#071126]/38" size={18} />
                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="admin@company.com"
                      required
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
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Password"
                      required
                      disabled={isLoading}
                      className="h-12 w-full rounded-xl border border-black/8 bg-white pl-11 pr-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
                    />
                  </div>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <label className="flex items-center gap-2 text-[13px] font-semibold text-[#071126]/74">
                  <input
                    id="remember-me"
                    type="checkbox"
                    className="h-4 w-4 rounded border-black/15 text-orange-600 focus:ring-orange-500"
                  />
                  Remember me
                </label>
                <Link href="/auth/forgot-password" className="text-[13px] font-bold text-orange-600 hover:text-orange-700">
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="shadow-button-dark mt-6 flex h-[52px] w-full items-center justify-center gap-3 rounded-full bg-[#071126] px-6 text-[14px] font-bold text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
                aria-label="Sign in to your workspace"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="animate-spin text-orange-400" size={18} />
                    Authenticating
                  </>
                ) : (
                  <>
                    Sign in
                    <ArrowRight size={18} className="text-orange-500" />
                  </>
                )}
              </button>

              <button
                type="button"
                className="shadow-button-light mt-3 flex h-[50px] w-full items-center justify-center gap-2 rounded-full border border-black/6 bg-white px-6 text-[14px] font-bold text-[#071126] transition hover:-translate-y-0.5"
                aria-label="Continue with Single Sign-On"
              >
                <Lock size={16} />
                Continue with SSO
              </button>
            </form>

            <p className="mt-5 text-center text-[14px] font-medium text-[#071126]/72">
              Need a workspace?{" "}
              <Link href="/auth/signup" className="font-black text-orange-600 hover:text-orange-700">
                Start a trial
              </Link>
            </p>
          </div>

          <div className="relative hidden min-h-[560px] lg:block">
            <div className="hero-shield left-[54%] top-3 opacity-[0.16]" />
            <div className="dot-field absolute right-4 top-6 h-48 w-56 opacity-55" />
            <div className="dot-field absolute bottom-12 left-6 h-36 w-48 opacity-45" />

            <div className="premium-panel absolute right-0 top-2 w-[520px] overflow-hidden rounded-[18px] bg-white/86 shadow-[0_28px_72px_rgba(7,17,38,0.13)]">
              <div className="dark-pattern px-7 py-6 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="!text-white/60 text-[12px] font-bold uppercase tracking-[0.16em]">
                      AI Operations
                    </p>
                    <h2 className="mt-2 !text-white text-[24px] font-black tracking-[-0.03em]">
                      WHOAI Command Center
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
                        AI Workflow
                      </p>
                      <p className="mt-1 text-[16px] font-black text-[#071126]">
                        Customer support automation
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
            </div>

            <div className="premium-panel absolute bottom-5 left-0 w-[260px] rounded-[16px] bg-white/90 p-5 shadow-[0_20px_56px_rgba(7,17,38,0.12)]">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#071126]/42">
                AI Success Rate
              </p>
              <div className="mt-4 flex items-end gap-3">
                <span className="text-[42px] font-black leading-none text-[#071126]">98%</span>
                <span className="mb-1 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-black text-emerald-700">
                  +24%
                </span>
              </div>
              <div className="mt-5 h-2 overflow-hidden rounded-full bg-black/6">
                <div className="h-full w-[74%] rounded-full bg-orange-500" />
              </div>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
