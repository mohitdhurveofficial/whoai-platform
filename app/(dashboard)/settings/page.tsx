import React from "react";
import { Building, CreditCard, Shield, Bell, Key, Plus, Save } from "lucide-react";

export default async function SettingsPage() {
  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-white">General Settings</h1>
          <p className="mt-1 text-[14px] text-[#A3A3A3]">Manage your workspace and organization profile.</p>
        </div>
      </header>

      <div className="space-y-6">
        
        {/* Organization Settings */}
        <section className="bg-[#0A0A0A] border border-[#222] rounded-xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-[#222]">
            <h2 className="text-[16px] font-bold text-white">Organization Profile</h2>
            <p className="text-[13px] text-[#A3A3A3] mt-1">Update your workspace details and branding.</p>
          </div>
          <div className="p-6 space-y-6">
            <div>
              <label className="block text-[13px] font-semibold text-[#888] uppercase tracking-wider mb-2">Workspace Name</label>
              <input type="text" defaultValue="Acme Corp" className="w-full max-w-md bg-[#111] border border-[#333] text-white px-3 py-2 rounded-md text-[13px] outline-none focus:border-[#555] transition-all" />
            </div>
            <div>
              <label className="block text-[13px] font-semibold text-[#888] uppercase tracking-wider mb-2">Workspace Slug</label>
              <div className="flex items-center max-w-md">
                <span className="bg-[#1A1A1A] border border-[#333] border-r-0 px-3 py-2 rounded-l-md text-[13px] text-[#666]">whoai.ai/</span>
                <input type="text" defaultValue="acme-corp" className="flex-1 bg-[#111] border border-[#333] text-white px-3 py-2 rounded-r-md text-[13px] outline-none focus:border-[#555] transition-all" />
              </div>
            </div>
          </div>
          <div className="p-4 bg-[#111] border-t border-[#222] flex justify-end">
            <button className="flex items-center gap-2 bg-[#FF6B00] text-white px-4 py-2 rounded-md shadow-sm text-[13px] font-medium hover:bg-[#E65A00] transition-colors">
              <Save className="h-4 w-4" /> Save Changes
            </button>
          </div>
        </section>

        {/* Danger Zone */}
        <section className="bg-[#0A0A0A] border border-[#FF0000]/20 rounded-xl shadow-sm overflow-hidden">
          <div className="p-6">
            <h2 className="text-[16px] font-bold text-[#FF0000]">Danger Zone</h2>
            <p className="text-[13px] text-[#A3A3A3] mt-1">Irreversible and destructive actions.</p>
            
            <div className="mt-6 flex flex-col md:flex-row md:items-center justify-between p-4 border border-[#FF0000]/20 bg-[#FF0000]/5 rounded-lg gap-4">
              <div>
                <p className="text-[14px] font-bold text-white">Delete Workspace</p>
                <p className="text-[13px] text-[#A3A3A3] mt-1">Permanently delete your workspace, agents, and all spend data.</p>
              </div>
              <button className="shrink-0 bg-[#FF0000]/10 border border-[#FF0000]/20 text-[#FF0000] font-semibold text-[13px] px-4 py-2 rounded-md hover:bg-[#FF0000]/20 transition-colors">
                Delete Workspace
              </button>
            </div>
          </div>
        </section>

      </div>
    </div>
  );
}
