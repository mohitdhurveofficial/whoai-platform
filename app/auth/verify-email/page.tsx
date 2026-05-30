"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [canResend, setCanResend] = useState(false);
  const [resendCountdown, setResendCountdown] = useState(0);

  useEffect(() => {
    if (resendCountdown > 0) {
      const timer = setTimeout(() => setResendCountdown(resendCountdown - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendCountdown === 0 && !canResend) {
      setCanResend(true);
    }
  }, [resendCountdown, canResend]);

  const handleCodeChange = (index: number, value: string) => {
    if (value.length <= 1 && /^[0-9]*$/.test(value)) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Auto-focus next input
      if (value && index < 5) {
        const nextInput = document.getElementById(`code-${index + 1}`);
        nextInput?.focus();
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const verificationCode = code.join("");
    if (verificationCode.length !== 6) {
      setError("Please enter the 6-digit code");
      return;
    }

    setIsLoading(true);

    try {
      // Placeholder: In production, verify the code with API
      if (verificationCode) {
        router.push("/onboarding");
      }
    } catch {
      setError("Invalid verification code. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setCanResend(false);
    setResendCountdown(60);
    // Placeholder: In production, resend verification email
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 mx-auto mb-4">
          <svg className="h-8 w-8 text-sky-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-slate-950">Verify your email</h2>
        <p className="text-slate-600 mt-2">Enter the 6-digit code we sent to your email</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-950 mb-4">Verification code</label>
        <div className="flex gap-2 justify-center">
          {code.map((digit, index) => (
            <input
              key={index}
              id={`code-${index}`}
              type="text"
              maxLength={1}
              value={digit}
              onChange={(e) => handleCodeChange(index, e.target.value)}
              className="h-12 w-12 rounded-xl border-2 border-slate-200 bg-white text-center text-lg font-semibold shadow-sm focus:border-sky-500 focus:outline-none"
              disabled={isLoading}
              autoFocus={index === 0}
            />
          ))}
        </div>
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
        {isLoading ? "Verifying..." : "Verify email"}
      </button>

      <div className="text-center">
        <p className="text-sm text-slate-600 mb-2">Didn't receive the code?</p>
        <button
          type="button"
          onClick={handleResend}
          disabled={!canResend}
          className="text-sm text-sky-600 hover:text-sky-700 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {canResend ? "Resend code" : `Resend in ${resendCountdown}s`}
        </button>
      </div>

      <div className="text-center">
        <Link href="/auth/login" className="text-sm text-slate-600 hover:text-slate-950">
          Back to login
        </Link>
      </div>
    </form>
  );
}
