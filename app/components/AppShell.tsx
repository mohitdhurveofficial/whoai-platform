"use client";

import type { ReactNode } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";
import { CommandPalette } from "./CommandPalette";

type AppShellProps = {
  title: string;
  description: string;
  actions?: ReactNode;
  children: ReactNode;
};

export default function AppShell({ title, description, actions, children }: AppShellProps) {
  return (
    <div className="whoai-page min-h-screen">
      <CommandPalette />
      
      <div className="md:flex">
        <Sidebar />

        <div className="flex-1 min-h-screen">
          <Topbar />

          <main className="mx-auto max-w-[1440px] px-4 py-6 sm:px-6 md:px-8 lg:px-10">
            <section className="mb-8 rounded-lg border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-950">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase text-orange-700 dark:text-orange-300">
                    Executive command center
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight text-slate-950 dark:text-white sm:text-4xl">
                    {title}
                  </h1>
                  <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 dark:text-slate-300">
                    {description}
                  </p>
                </div>
                {actions ? <div className="flex items-center gap-3">{actions}</div> : null}
              </div>
            </section>

            {children}
          </main>
        </div>
      </div>
    </div>
  );
}
