"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    setError("");
    setIsLoading(true);

    if (!email || !password) {
      setError("Please enter email and password");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(
        "/api/ai-workers/auth/login",
        {
          method: "POST",
          headers: {
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            email,
            password,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(
          data.error || "Login failed"
        );
      }

      if (!data.token) {
        throw new Error(
          "Token not received"
        );
      }

      localStorage.setItem(
        "token",
        data.token
      );

      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      localStorage.setItem(
        "is_authenticated",
        "true"
      );

      router.refresh();
      router.push("/dashboard");
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Authentication failed";

      setError(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="email"
          className="block text-sm font-medium text-slate-950 mb-2"
        >
          Email address
        </label>

        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          placeholder="you@example.com"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          disabled={isLoading}
        />
      </div>

      <div>
        <label
          htmlFor="password"
          className="block text-sm font-medium text-slate-950 mb-2"
        >
          Password
        </label>

        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          placeholder="••••••••"
          className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm placeholder-slate-400 shadow-sm focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-sky-500"
          disabled={isLoading}
        />
      </div>

      <div className="flex items-center justify-between text-sm">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            className="rounded border-slate-300"
          />
          <span className="text-slate-600">
            Remember me
          </span>
        </label>

        <Link
          href="/auth/forgot-password"
          className="text-sky-600 hover:text-sky-700 font-medium"
        >
          Forgot password?
        </Link>
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
        {isLoading
          ? "Signing in..."
          : "Sign in"}
      </button>

      <p className="text-center text-sm text-slate-600">
        Don&apos;t have an account?{" "}
        <Link
          href="/auth/signup"
          className="text-sky-600 hover:text-sky-700 font-semibold"
        >
          Sign up
        </Link>
      </p>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200"></div>
        </div>

        <div className="relative flex justify-center text-sm">
          <span className="bg-gradient-to-br from-slate-50 via-slate-50 to-sky-50 px-2 text-slate-500">
            Enterprise login options
          </span>
        </div>
      </div>

      <button
        type="button"
        className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 transition"
      >
        Continue with SSO
      </button>
    </form>
  );
}
