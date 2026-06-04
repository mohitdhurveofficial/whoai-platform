import React from "react";
import { Building, CreditCard, Shield, Bell, Key, Plus, Save } from "lucide-react";

export default async function SettingsPage() {
  return (
    <div className="p-10 max-w-[1200px] mx-auto space-y-8 bg-[#FAF7F3] min-h-screen text-[#111111] font-sans">
      
      {/* HEADER */}
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[28px] font-bold tracking-tight text-[#111111]">Settings</h1>
          <p className="mt-1.5 text-[15px] text-[#666666]">Manage your workspace, billing, and API credentials.</p>
        </div>
      </header>

      <div className="flex gap-8">
        
        {/* SIDEBAR NAVIGATION */}
        <div className="w-[240px] shrink-0">
          <nav className="flex flex-col gap-1 sticky top-10">
            <button className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium rounded-md bg-[#FFFFFF] border border-[#EEE8E2] text-[#111111] shadow-sm">
              <Building className="h-4 w-4 text-[#FF6B00]" /> Organization
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium rounded-md text-[#666666] hover:bg-[#FFFFFF] hover:text-[#111111] border border-transparent transition-colors">
              <CreditCard className="h-4 w-4" /> Billing & Usage
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium rounded-md text-[#666666] hover:bg-[#FFFFFF] hover:text-[#111111] border border-transparent transition-colors">
              <Shield className="h-4 w-4" /> Security & Limits
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium rounded-md text-[#666666] hover:bg-[#FFFFFF] hover:text-[#111111] border border-transparent transition-colors">
              <Bell className="h-4 w-4" /> Notifications
            </button>
            <button className="flex items-center gap-3 px-3 py-2 text-[14px] font-medium rounded-md text-[#666666] hover:bg-[#FFFFFF] hover:text-[#111111] border border-transparent transition-colors">
              <Key className="h-4 w-4" /> API Keys
            </button>
          </nav>
        </div>

        {/* SETTINGS CONTENT */}
        <div className="flex-1 space-y-6">
          
          {/* Organization Settings */}
          <section className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#EEE8E2]">
              <h2 className="text-[16px] font-bold text-[#111111]">Organization Profile</h2>
              <p className="text-[13px] text-[#888888] mt-1">Update your workspace details and branding.</p>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-[13px] font-semibold text-[#111111] mb-2">Workspace Name</label>
                <input type="text" defaultValue="Acme Corp" className="w-full max-w-md bg-[#FAFAFA] border border-[#EEE8E2] px-3 py-2 rounded-md text-[13px] outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/20 transition-all" />
              </div>
              <div>
                <label className="block text-[13px] font-semibold text-[#111111] mb-2">Workspace Slug</label>
                <div className="flex items-center max-w-md">
                  <span className="bg-[#FAFAFA] border border-[#EEE8E2] border-r-0 px-3 py-2 rounded-l-md text-[13px] text-[#888888]">whoai.ai/</span>
                  <input type="text" defaultValue="acme-corp" className="flex-1 bg-[#FAFAFA] border border-[#EEE8E2] px-3 py-2 rounded-r-md text-[13px] outline-none focus:border-[#FF6B00] focus:ring-1 focus:ring-[#FF6B00]/20 transition-all" />
                </div>
              </div>
            </div>
            <div className="p-4 bg-[#FAFAFA] border-t border-[#EEE8E2] flex justify-end">
              <button className="flex items-center gap-2 bg-[#111111] text-white px-4 py-2 rounded-md shadow-sm text-[13px] font-medium hover:bg-[#222222] transition-colors">
                <Save className="h-4 w-4" /> Save Changes
              </button>
            </div>
          </section>

          {/* API Keys */}
          <section className="bg-[#FFFFFF] border border-[#EEE8E2] rounded-xl shadow-sm overflow-hidden">
            <div className="p-6 border-b border-[#EEE8E2] flex items-center justify-between">
              <div>
                <h2 className="text-[16px] font-bold text-[#111111]">Gateway API Keys</h2>
                <p className="text-[13px] text-[#888888] mt-1">Manage keys used to authenticate with the WHOAI Gateway.</p>
              </div>
              <button className="flex items-center gap-2 bg-[#FAFAFA] border border-[#EEE8E2] text-[#111111] px-3 py-1.5 rounded-md shadow-sm text-[13px] font-medium hover:bg-[#F5F5F5] transition-colors">
                <Plus className="h-4 w-4" /> Create Key
              </button>
            </div>
            <div className="p-0">
              <table className="w-full text-left text-[13px]">
                <thead className="bg-[#FAFAFA] border-b border-[#EEE8E2]">
                  <tr>
                    <th className="px-6 py-3 font-semibold text-[#888888]">Name</th>
                    <th className="px-6 py-3 font-semibold text-[#888888]">Token Preview</th>
                    <th className="px-6 py-3 font-semibold text-[#888888]">Created</th>
                    <th className="px-6 py-3 text-right font-semibold text-[#888888]">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EEE8E2]">
                  <tr className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#111111]">Production Gateway</td>
                    <td className="px-6 py-4 font-mono text-[#888888]">wh_prod_8x92...</td>
                    <td className="px-6 py-4 text-[#888888]">Oct 12, 2025</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#E6F4EA] text-[#047857] font-bold text-[11px]">Active</span>
                    </td>
                  </tr>
                  <tr className="hover:bg-[#FAFAFA] transition-colors">
                    <td className="px-6 py-4 font-semibold text-[#111111]">Staging Environment</td>
                    <td className="px-6 py-4 font-mono text-[#888888]">wh_test_2b4z...</td>
                    <td className="px-6 py-4 text-[#888888]">Nov 05, 2025</td>
                    <td className="px-6 py-4 text-right">
                      <span className="inline-flex items-center px-2 py-1 rounded bg-[#E6F4EA] text-[#047857] font-bold text-[11px]">Active</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>

          {/* Danger Zone */}
          <section className="bg-[#FFFFFF] border border-[#DC2626]/20 rounded-xl shadow-sm overflow-hidden">
            <div className="p-6">
              <h2 className="text-[16px] font-bold text-[#DC2626]">Danger Zone</h2>
              <p className="text-[13px] text-[#888888] mt-1">Irreversible and destructive actions.</p>
              
              <div className="mt-6 flex items-center justify-between p-4 border border-[#DC2626]/20 rounded-lg">
                <div>
                  <p className="text-[14px] font-bold text-[#111111]">Delete Workspace</p>
                  <p className="text-[13px] text-[#666666] mt-1">Permanently delete your workspace, agents, and all spend data.</p>
                </div>
                <button className="bg-[#FFF0F0] text-[#DC2626] font-semibold text-[13px] px-4 py-2 rounded-md hover:bg-[#FEE2E2] transition-colors">
                  Delete Workspace
                </button>
              </div>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}
