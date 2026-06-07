import { KeyRound, Plus, Copy, Trash2 } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-white">API Keys</h1>
          <p className="mt-1 text-[14px] text-[#A3A3A3]">
            Manage API keys for accessing the WHOAI Gateway.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-md bg-[#FF6B00] hover:bg-[#E65A00] transition-colors px-4 py-2 font-medium text-white text-[13px] shadow-sm">
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </header>

      <section className="bg-[#0A0A0A] border border-[#222] rounded-xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-[#222] flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-[#FF6B00]" />
          <h2 className="text-[16px] font-bold text-white">Active Keys</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-[#111] border-b border-[#222]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#888] uppercase tracking-wider text-[11px]">Name</th>
                <th className="px-6 py-4 font-semibold text-[#888] uppercase tracking-wider text-[11px]">Token Preview</th>
                <th className="px-6 py-4 font-semibold text-[#888] uppercase tracking-wider text-[11px]">Created</th>
                <th className="px-6 py-4 text-right font-semibold text-[#888] uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#222]">
              <tr className="hover:bg-[#1A1A1A] transition-colors group">
                <td className="px-6 py-4 font-semibold text-white">Production Gateway</td>
                <td className="px-6 py-4 font-mono text-[#A3A3A3]">wh_prod_8x92...</td>
                <td className="px-6 py-4 text-[#A3A3A3]">Oct 12, 2025</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Copy Key" className="p-1.5 text-[#888] hover:bg-[#222] hover:text-white rounded transition-colors"><Copy className="h-4 w-4" /></button>
                    <button title="Revoke" className="p-1.5 text-[#888] hover:bg-[#FF0000]/10 hover:text-[#FF0000] rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-[#1A1A1A] transition-colors group">
                <td className="px-6 py-4 font-semibold text-white">Staging Environment</td>
                <td className="px-6 py-4 font-mono text-[#A3A3A3]">wh_test_2b4z...</td>
                <td className="px-6 py-4 text-[#A3A3A3]">Nov 05, 2025</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Copy Key" className="p-1.5 text-[#888] hover:bg-[#222] hover:text-white rounded transition-colors"><Copy className="h-4 w-4" /></button>
                    <button title="Revoke" className="p-1.5 text-[#888] hover:bg-[#FF0000]/10 hover:text-[#FF0000] rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
