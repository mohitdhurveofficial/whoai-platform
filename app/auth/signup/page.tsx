"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignupPage() {
  const router = useRouter();
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

    let data: { error?: string; redirectTo?: string } = {};

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
    if ((data as any).token) {
  document.cookie = `whoai_auth=${(data as any).token}; path=/; max-age=86400; SameSite=Lax`;
}

if ((data as any).user) {
  localStorage.setItem("user", JSON.stringify((data as any).user));
}

localStorage.setItem("is_authenticated", "true");

window.location.href = "/dashboard";
  } catch (err: unknown) {
    setError(
      err instanceof Error
        ? err.message
        : "Signup failed. Please try again."
    );
  } finally {
    setIsLoading(false);
  }
};

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="fullName" className="mb-2 block text-[13px] font-bold text-[#071126]">
          Full name
        </label>
        <input
          id="fullName"
          name="fullName"
          type="text"
          value={formData.fullName}
          onChange={handleChange}
          placeholder="Jane Smith"
          className="h-12 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="email" className="mb-2 block text-[13px] font-bold text-[#071126]">
          Email address
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          placeholder="jane@company.com"
          className="h-12 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="company" className="mb-2 block text-[13px] font-bold text-[#071126]">
          Organization name
        </label>
        <input
          id="company"
          name="company"
          type="text"
          value={formData.company}
          onChange={handleChange}
          placeholder="Your Company Inc."
          className="h-12 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="password" className="mb-2 block text-[13px] font-bold text-[#071126]">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          placeholder="••••••••"
          className="h-12 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          disabled={isLoading}
        />
      </div>

      <div>
        <label htmlFor="confirmPassword" className="mb-2 block text-[13px] font-bold text-[#071126]">
          Confirm password
        </label>
        <input
          id="confirmPassword"
          name="confirmPassword"
          type="password"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="••••••••"
          className="h-12 w-full rounded-xl border border-black/8 bg-white px-4 text-[14px] font-semibold text-[#071126] outline-none transition placeholder:text-[#071126]/35 focus:border-orange-400 focus:ring-4 focus:ring-orange-100"
          disabled={isLoading}
        />
      </div>

      <label className="flex items-start gap-3 cursor-pointer">
        <input
          type="checkbox"
          checked={agreeToTerms}
          onChange={(e) => setAgreeToTerms(e.target.checked)}
          className="mt-1 h-4 w-4 rounded border-black/15 text-orange-600 focus:ring-orange-500"
        />
        <span className="text-sm text-[#071126]/74">
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

      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading || !agreeToTerms}
        className="shadow-button-dark flex h-[52px] w-full items-center justify-center rounded-full bg-[#071126] px-6 text-[14px] font-bold text-white transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60"
      >
        {isLoading ? "Creating account..." : "Create account"}
      </button>

      <p className="text-center text-[14px] font-medium text-[#071126]/72">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-black text-orange-600 hover:text-orange-700">
          Sign in
        </Link>
      </p>
    </form>
  );
}
