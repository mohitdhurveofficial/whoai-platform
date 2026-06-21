import { KeyRound, Plus, Copy, Trash2 } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="space-y-8">
      <header className="flex items-start justify-between">
        <div>
          <h1 className="text-[24px] font-bold tracking-tight text-[#111111]">API Keys</h1>
          <p className="mt-1 text-[14px] text-[#666666]">
            Manage API keys for accessing the WHOAI Gateway.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-md bg-[#FF6B00] hover:bg-[#E65A00] transition-colors px-4 py-2 font-medium text-white text-[13px] shadow-sm">
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </header>

      <section className="bg-[#FAF7F3] border border-[#EEE8E2] rounded-2xl shadow-[0_1px_2px_rgba(17,17,17,0.05)] overflow-hidden">
        <div className="p-6 border-b border-[#EEE8E2] flex items-center gap-3">
          <KeyRound className="h-5 w-5 text-[#FF6B00]" />
          <h2 className="text-[16px] font-bold text-[#111111]">Active Keys</h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-[13px]">
            <thead className="bg-white border-b border-[#EEE8E2]">
              <tr>
                <th className="px-6 py-4 font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Name</th>
                <th className="px-6 py-4 font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Token Preview</th>
                <th className="px-6 py-4 font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Created</th>
                <th className="px-6 py-4 text-right font-semibold text-[#888888] uppercase tracking-wider text-[11px]">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EEE8E2]">
              <tr className="hover:bg-[#FAF7F3] transition-colors group">
                <td className="px-6 py-4 font-semibold text-[#111111]">Production Gateway</td>
                <td className="px-6 py-4 font-mono text-[#666666]">wh_prod_8x92...</td>
                <td className="px-6 py-4 text-[#666666]">Oct 12, 2025</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Copy Key" className="p-1.5 text-[#888888] hover:bg-[#FAF7F3] hover:text-[#111111] rounded transition-colors"><Copy className="h-4 w-4" /></button>
                    <button title="Revoke" className="p-1.5 text-[#888888] hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
                  </div>
                </td>
              </tr>
              <tr className="hover:bg-[#FAF7F3] transition-colors group">
                <td className="px-6 py-4 font-semibold text-[#111111]">Staging Environment</td>
                <td className="px-6 py-4 font-mono text-[#666666]">wh_test_2b4z...</td>
                <td className="px-6 py-4 text-[#666666]">Nov 05, 2025</td>
                <td className="px-6 py-4 text-right">
                  <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button title="Copy Key" className="p-1.5 text-[#888888] hover:bg-[#FAF7F3] hover:text-[#111111] rounded transition-colors"><Copy className="h-4 w-4" /></button>
                    <button title="Revoke" className="p-1.5 text-[#888888] hover:bg-red-50 hover:text-red-600 rounded transition-colors"><Trash2 className="h-4 w-4" /></button>
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
