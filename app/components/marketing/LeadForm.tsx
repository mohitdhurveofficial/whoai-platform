"use client";

import React, { useState } from "react";
import { ArrowRight, CheckCircle2, Loader2 } from "lucide-react";

const SPEND_OPTIONS = [
  "Under $1k / month",
  "$1k – $5k / month",
  "$5k – $20k / month",
  "$20k – $100k / month",
  "$100k+ / month",
];

type LeadKind = "DEMO" | "CONTACT";

/**
 * Lead-capture form used by /demo and /contact. POSTs to /api/leads, which
 * persists the lead and emails sales. `kind` distinguishes the two flows.
 */
export default function LeadForm({ kind }: { kind: LeadKind }) {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setStatus("submitting");
    setError(null);

    const form = e.currentTarget;
    const data = new FormData(form);
    const payload = {
      type: kind,
      name: String(data.get("name") || "").trim(),
      email: String(data.get("email") || "").trim(),
      company: String(data.get("company") || "").trim(),
      monthlySpend: String(data.get("monthlySpend") || ""),
      message: String(data.get("message") || "").trim(),
    };

    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || "Something went wrong. Please try again.");
      }
      setStatus("success");
      form.reset();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Something went wrong.");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-xl border border-[#EEE8E2] bg-white p-8 shadow-sm text-center">
        <CheckCircle2 className="h-12 w-12 text-[#047857] mx-auto mb-4" />
        <h3 className="text-[20px] font-bold text-[#111111] mb-2">Thanks — we&apos;ll be in touch.</h3>
        <p className="text-[15px] text-[#666666]">
          {kind === "DEMO"
            ? "A member of our team will reach out within one business day to schedule your demo."
            : "We&apos;ve received your message and will respond within one business day."}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-xl border border-[#EEE8E2] bg-white p-6 sm:p-8 shadow-sm space-y-5">
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Full name" name="name" placeholder="Jane Doe" required />
        <Field label="Work email" name="email" type="email" placeholder="jane@company.com" required />
      </div>
      <div className="grid sm:grid-cols-2 gap-5">
        <Field label="Company" name="company" placeholder="Acme Inc." />
        <div>
          <label htmlFor="monthlySpend" className="block text-[13px] font-semibold text-[#111111] mb-2">
            Monthly AI spend
          </label>
          <select
            id="monthlySpend"
            name="monthlySpend"
            defaultValue=""
            className="w-full rounded-md border border-[#EEE8E2] bg-white px-3 py-2.5 text-[14px] text-[#111111] focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
          >
            <option value="" disabled>Select a range</option>
            {SPEND_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="message" className="block text-[13px] font-semibold text-[#111111] mb-2">
          {kind === "DEMO" ? "What would you like to see? (optional)" : "How can we help? (optional)"}
        </label>
        <textarea
          id="message"
          name="message"
          rows={4}
          placeholder={kind === "DEMO" ? "We run ~40 agents on GPT-4o and want budget alerts…" : "Tell us a bit about your use case…"}
          className="w-full rounded-md border border-[#EEE8E2] bg-white px-3 py-2.5 text-[14px] text-[#111111] focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
        />
      </div>

      {status === "error" && error && (
        <p className="text-[13px] text-[#DC2626]">{error}</p>
      )}

      <button
        type="submit"
        disabled={status === "submitting"}
        className="w-full inline-flex items-center justify-center gap-2 bg-[#FF6B00] text-white px-6 py-3.5 rounded-md font-semibold text-[15px] hover:bg-[#E65A00] transition-colors shadow-md disabled:opacity-60 disabled:cursor-not-allowed"
      >
        {status === "submitting" ? (
          <><Loader2 className="h-4 w-4 animate-spin" /> Sending…</>
        ) : (
          <>{kind === "DEMO" ? "Request demo" : "Send message"} <ArrowRight className="h-4 w-4" /></>
        )}
      </button>
      <p className="text-[12px] text-[#888888] text-center">
        By submitting, you agree to our{" "}
        <a href="/privacy" className="underline hover:text-[#111111]">Privacy Policy</a>.
      </p>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
}) {
  return (
    <div>
      <label htmlFor={name} className="block text-[13px] font-semibold text-[#111111] mb-2">
        {label}{required && <span className="text-[#FF6B00]"> *</span>}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        placeholder={placeholder}
        className="w-full rounded-md border border-[#EEE8E2] bg-white px-3 py-2.5 text-[14px] text-[#111111] placeholder:text-[#B3B3B3] focus:border-[#FF6B00] focus:outline-none focus:ring-1 focus:ring-[#FF6B00]"
      />
    </div>
  );
}
