"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { createBrowserClient } from "@supabase/ssr";
import { Reveal, Stagger, StaggerItem } from "@/app/components/marketing/Motion";

// A browser Supabase client is created inline because the repo only ships a
// server client (@/utils/supabase/server). The recovery link from the
// forgot-password flow lands here with a session in the URL, which the browser
// client picks up automatically (detectSessionInUrl) to authorize updateUser.
function getSupabase() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [hasSession, setHasSession] = useState<boolean | null>(null);

  // Confirm the user arrived via a valid recovery link before showing the form.
  useEffect(() => {
    const supabase = getSupabase();
    let active = true;

    supabase.auth
      .getSession()
      .then(({ data }) => {
        if (active) setHasSession(Boolean(data.session));
      })
      .catch(() => {
        if (active) setHasSession(false);
      });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (active && session) setHasSession(true);
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setIsLoading(true);

    try {
      const supabase = getSupabase();
      const { error: updateError } = await supabase.auth.updateUser({
        password,
      });

      if (updateError) {
        setError(updateError.message || "Could not reset your password. Please request a new link.");
        return;
      }

      setSuccess(true);
      setTimeout(() => router.push("/auth/login"), 2500);
    } catch {
      setError("Could not reset your password. Please request a new link.");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Reveal className="space-y-6 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-orange-100 mx-auto">
          <svg className="h-8 w-8 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-bold text-[#071126]">Password updated</h2>
          <p className="text-[#071126]/70 mt-2">Your password has been reset. Redirecting you to sign in&hellip;</p>
        </div>
        <Link href="/auth/login" className="inline-block font-bold text-orange-600 hover:text-orange-700">
          Back to login
        </Link>
      </Reveal>
    );
  }

  if (hasSession === false) {
    return (
      <Reveal className="space-y-6 text-center">
        <div>
          <h2 className="text-xl font-bold text-[#071126]">Reset link invalid or expired</h2>
          <p className="text-[#071126]/70 mt-2">This password reset link is no longer valid. Request a new one to continue.</p>
        </div>
        <Link href="/auth/forgot-password" className="inline-block font-bold text-orange-600 hover:text-orange-700">
          Request a new link
        </Link>
      </Reveal>
    );
  }

  return (
    <Stagger className="space-y-5" stagger={0.1}>
      <StaggerItem>
        <h2 className="text-xl font-bold text-[#071126] mb-2">Set a new password</h2>
        <p className="text-sm text-[#071126]/70">Choose a new password for your account.</p>
      </StaggerItem>

      <StaggerItem>
      <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label htmlFor="password" className="mb-2 block text-[13px] font-bold text-[#071126]">
          New password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="At least 8 characters"
          autoComplete="new-password"
          className="h-12 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          disabled={isLoading || hasSession === null}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-bold text-[#071126]">
          Confirm new password
        </label>
        <input
          id="confirmPassword"
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Re-enter your password"
          autoComplete="new-password"
          className="h-12 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          disabled={isLoading || hasSession === null}
        />
      </div>

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || hasSession === null}
        className="shadow-button-dark flex h-[52px] w-full items-center justify-center rounded-full bg-[#071126] px-6 text-[14px] font-bold text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
        {hasSession === null ? "Loading…" : isLoading ? "Updating…" : "Update password"}
      </button>

      <div className="text-center">
        <Link href="/auth/login" className="text-sm font-bold text-orange-600 hover:text-orange-700">
          Back to login
        </Link>
      </div>
      </form>
      </StaggerItem>
    </Stagger>
  );
}
