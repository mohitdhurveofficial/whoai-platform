"use client";

import { useState } from "react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email.trim()) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim() }),
      });

      if (!res.ok) {
        let message = "Failed to process request. Please try again.";
        try {
          const data = (await res.json()) as { error?: string };
          if (data?.error) message = data.error;
        } catch {
          // ignore non-JSON error bodies
        }
        setError(message);
        return;
      }

      // The endpoint always returns an enumeration-safe success message.
      setSubmitted(true);
    } catch {
      setError("Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mx-auto">
          <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#071126]">Check your email</h2>
          <p className="text-[#071126]/70 mt-2">We&apos;ve sent a password reset link to {email}. Click the link in the email to reset your password.</p>
        </div>
        <div className="text-sm text-[#071126]/70">
          Didn&apos;t receive the email?{" "}
          <button onClick={() => setSubmitted(false)} className="font-bold text-orange-600 hover:text-orange-700">
            Try again
          </button>
        </div>
        <Link href="/auth/login" className="inline-block font-bold text-orange-600 hover:text-orange-700">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-[#071126] mb-2">Forgot your password?</h2>
        <p className="text-sm text-[#071126]/70">Enter your email address and we&apos;ll send you a link to reset your password.</p>
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-[13px] font-bold text-[#071126]">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="h-12 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          disabled={isLoading}
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="shadow-button-dark flex h-[52px] w-full items-center justify-center rounded-full bg-[#071126] px-6 text-[14px] font-bold text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </button>

      <div className="text-center">
        <Link href="/auth/login" className="text-sm font-bold text-orange-600 hover:text-orange-700">
          Back to login
        </Link>
      </div>
    </form>
  );
}
