"use client";

import React, { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Loader2, Lock, Mail, ShieldCheck, TriangleAlert, UserRound } from "lucide-react";

/**
 * Invitation acceptance.
 *
 * The token in the URL is the only credential the invitee has, so the page
 * resolves it server-side first and refuses to render a form for a dead link.
 * The email field is fixed to the invited address — the API rejects a mismatch
 * anyway, and an editable field would just invite a confusing 403.
 */

type InviteInfo = {
  email: string;
  role: string;
  organizationName: string;
};

/** Fetched outside the component so the mount effect stays a plain promise chain. */
async function verifyInvite(token: string): Promise<InviteInfo> {
  const res = await fetch(`/api/team/invites/verify?token=${encodeURIComponent(token)}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "This invitation link is invalid or has expired.");
  return data as InviteInfo;
}

const fieldClass =
  "w-full rounded-xl border border-[#EEE8E2] bg-white px-11 py-3 text-[15px] text-[#111111] placeholder:text-[#999999] focus-visible:border-[#FF6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]/30";

function AcceptInviteForm() {
  const token = useSearchParams().get("token") ?? "";

  const [invite, setInvite] = useState<InviteInfo | null>(null);
  // A missing token is knowable at render time, so it seeds initial state
  // rather than being set from inside the effect (react-hooks/set-state-in-effect).
  const [checking, setChecking] = useState(Boolean(token));
  const [linkError, setLinkError] = useState(token ? "" : "This invitation link is missing its token.");

  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) return;
    verifyInvite(token)
      .then(setInvite)
      .catch((err: Error) => setLinkError(err.message))
      .finally(() => setChecking(false));
  }, [token]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError("");

    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName,
          email: invite?.email,
          password,
          inviteToken: token,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Could not accept the invitation.");

      if (data.user) localStorage.setItem("user", JSON.stringify(data.user));
      localStorage.setItem("is_authenticated", "true");
      window.location.href = "/dashboard";
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Could not accept the invitation.");
      setSubmitting(false);
    }
  };

  if (checking) {
    return (
      <div className="flex items-center gap-3 text-[15px] text-[#666666]" role="status">
        <Loader2 className="h-5 w-5 animate-spin text-[#FF6B00]" />
        Checking your invitation…
      </div>
    );
  }

  if (linkError || !invite) {
    return (
      <div className="w-full max-w-[440px] rounded-2xl border border-[#EEE8E2] bg-white p-8 text-center shadow-sm">
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-50">
          <TriangleAlert className="h-6 w-6 text-red-600" />
        </div>
        <h1 className="text-[20px] font-bold text-[#111111]">Invitation unavailable</h1>
        <p className="mt-2 text-[15px] leading-relaxed text-[#666666]">{linkError}</p>
        <p className="mt-4 text-[14px] text-[#888888]">
          Ask whoever invited you to send a new link.
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex rounded-md border border-[#EEE8E2] px-4 py-2.5 text-[14px] font-medium text-[#111111] transition-colors hover:border-[#DCD5CD] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
        >
          Back to WHOAI
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[440px] rounded-2xl border border-[#EEE8E2] bg-white p-8 shadow-sm">
      <div className="mb-6">
        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#FFD9C2] bg-[#FFF5F0] px-3 py-1 text-[12px] font-semibold text-[#FF6B00]">
          <ShieldCheck className="h-3.5 w-3.5" />
          {invite.role.toLowerCase()} access
        </div>
        <h1 className="text-[24px] font-bold tracking-tight text-[#111111]">
          Join {invite.organizationName}
        </h1>
        <p className="mt-1.5 text-[15px] text-[#666666]">
          Set a password to finish creating your account.
        </p>
      </div>

      {error && (
        <div
          role="alert"
          className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-[14px] font-semibold text-red-700"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="invite-email" className="mb-1.5 block text-[13px] font-semibold text-[#111111]">
            Email
          </label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
            {/* Locked to the invited address: the API rejects any other, so an
                editable field would only produce a confusing rejection. */}
            <input
              id="invite-email"
              type="email"
              value={invite.email}
              readOnly
              aria-readonly="true"
              className={`${fieldClass} cursor-not-allowed bg-[#FAF7F3] text-[#666666]`}
            />
          </div>
        </div>

        <div>
          <label htmlFor="invite-name" className="mb-1.5 block text-[13px] font-semibold text-[#111111]">
            Full name
          </label>
          <div className="relative">
            <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
            <input
              id="invite-name"
              name="fullName"
              value={fullName}
              onChange={(event) => setFullName(event.target.value)}
              required
              autoComplete="name"
              placeholder="Ada Lovelace"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="invite-password" className="mb-1.5 block text-[13px] font-semibold text-[#111111]">
            Password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
            <input
              id="invite-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              minLength={8}
              autoComplete="new-password"
              placeholder="At least 8 characters"
              className={fieldClass}
            />
          </div>
        </div>

        <div>
          <label htmlFor="invite-confirm" className="mb-1.5 block text-[13px] font-semibold text-[#111111]">
            Confirm password
          </label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#999999]" />
            <input
              id="invite-confirm"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              required
              autoComplete="new-password"
              placeholder="Re-enter your password"
              className={fieldClass}
            />
          </div>
        </div>

        <button
          type="submit"
          disabled={submitting}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#FF6B00] px-4 py-3 text-[15px] font-semibold text-white transition-colors hover:bg-[#E65A00] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2"
        >
          {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {submitting ? "Joining…" : `Join ${invite.organizationName}`}
        </button>
      </form>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <main className="texture flex min-h-screen items-center justify-center px-4 py-12">
      {/* useSearchParams needs a Suspense boundary above it during prerender. */}
      <Suspense
        fallback={
          <div className="flex items-center gap-3 text-[15px] text-[#666666]" role="status">
            <Loader2 className="h-5 w-5 animate-spin text-[#FF6B00]" />
            Loading…
          </div>
        }
      >
        <AcceptInviteForm />
      </Suspense>
    </main>
  );
}
