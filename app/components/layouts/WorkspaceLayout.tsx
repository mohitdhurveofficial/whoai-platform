"use client";

import Sidebar from "@/app/components/Sidebar";
import { Search, Bell } from "lucide-react";

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar />

      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-16 border-b bg-white flex items-center justify-between px-6">
          <div className="relative w-full max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 border rounded-lg"
            />
          </div>

          <div className="flex items-center gap-4">
            <Bell className="h-5 w-5" />
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center">
              WA
            </div>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}