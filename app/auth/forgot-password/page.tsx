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
    setIsLoading(true);

    try {
      if (email) {
        setSubmitted(true);
      } else {
        setError("Please enter your email address");
      }
    } catch {
      setError("Failed to process request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="space-y-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 mx-auto">
          <svg className="h-8 w-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-semibold text-slate-950">Check your email</h2>
          <p className="text-slate-600 mt-2">We&apos;ve sent a password reset link to {email}. Click the link in the email to reset your password.</p>
        </div>
        <div className="text-sm text-slate-600">
          Didn&apos;t receive the email?{" "}
          <button onClick={() => setSubmitted(false)} className="text-sky-600 hover:text-sky-700 font-medium">
            Try again
          </button>
        </div>
        <Link href="/auth/login" className="inline-block text-sky-600 hover:text-sky-700 font-medium">
          Back to login
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <h2 className="text-xl font-semibold text-slate-950 mb-2">Forgot your password?</h2>
        <p className="text-sm text-slate-600">Enter your email address and we&apos;ll send you a link to reset your password.</p>
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-slate-950 mb-2">
          Email address
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
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
        className="w-full rounded-2xl bg-sky-600 px-4 py-3 text-sm font-semibold text-white shadow-lg hover:bg-sky-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
      >
        {isLoading ? "Sending..." : "Send reset link"}
      </button>

      <div className="text-center">
        <Link href="/auth/login" className="text-sm text-sky-600 hover:text-sky-700 font-medium">
          Back to login
        </Link>
      </div>
    </form>
  );
}
