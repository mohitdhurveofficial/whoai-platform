"use client";

import Link from "next/link";


export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-slate-900 dark:text-white">
            Settings
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400">
            Manage your WHOAI workspace configuration and preferences.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="h-8 w-8 rounded-lg bg-blue-600" />
            <h2 className="text-xl font-bold">
              WHOAI Settings Center
            </h2>
          </div>

          <p className="text-slate-600 dark:text-slate-400 mb-6">
            Workspace settings, billing controls, user management,
            integrations, and enterprise configuration will be managed
            from this page.
          </p>

          <div className="flex gap-4">
            <Link
              href="/dashboard"
              className="rounded-xl bg-blue-600 px-4 py-2 text-white"
            >
              Go to Dashboard
            </Link>

            <Link
              href="/executive-dashboard"
              className="rounded-xl border px-4 py-2"
            >
              Executive Dashboard
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}