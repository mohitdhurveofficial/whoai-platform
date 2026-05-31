import React from "react";
import Sidebar from "../components/Sidebar";
import { Search, Bell, Settings } from "lucide-react";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden w-full">
      {/* Reuse existing Sidebar without modification */}
      <Sidebar />
      
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        {/* Top Command Bar */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex-1 flex items-center">
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <input 
                type="text" 
                placeholder="Search AI agents, policies, or decisions... (Cmd+K)" 
                className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
              <Bell className="h-5 w-5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-sm font-semibold shadow-sm">
              WA
            </div>
          </div>
        </header>
        
        {/* Main Scrollable Workspace */}
        <main className="flex-1 overflow-y-auto w-full relative">
          {children}
        </main>
      </div>
    </div>
  );
}