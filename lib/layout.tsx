"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const handleLogout = () => {
    document.cookie = "whoai_auth=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    localStorage.clear();
    router.push("/auth/login");
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F3] overflow-hidden w-full">
      
      <aside className="hidden lg:flex w-64 bg-white border-r flex-col shrink-0">
        <div className="p-6 font-bold text-xl tracking-tight text-blue-600">WHOAI</div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/dashboard" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            📊 Dashboard
          </Link>
          <Link href="/agents" className="block px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-lg">
            🤖 My Agents
          </Link>
        </nav>
        <div className="p-4 border-t">
          <button 
            onClick={handleLogout}
            className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <div className="lg:hidden sticky top-0 z-40 flex h-16 items-center justify-between border-b bg-white px-4">
        <div className="font-bold text-lg text-blue-600">WHOAI</div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full">
        <header className="h-16 bg-white border-b flex items-center justify-between px-4 sm:px-6 lg:px-8">
          <h1 className="text-sm font-medium text-gray-500 uppercase tracking-widest">
            Operational Control Plane
          </h1>
        </header>
        <div className="p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}