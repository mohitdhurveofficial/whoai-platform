import React from "react";
import Sidebar from "../components/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen bg-[#FAF7F3] font-sans text-[#111111] overflow-hidden w-full selection:bg-[#FF6B00] selection:text-white">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden w-full">
        <main className="flex-1 overflow-y-auto w-full relative pb-12">
          {children}
        </main>
      </div>
    </div>
  );
}
