import React from "react";
import { Key, Link, Cpu } from "lucide-react";
import type { AIIdentity } from "./types";

export function WorkerCredentialsCard({ identity }: { identity: AIIdentity }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Key size={16} className="text-purple-500" /> Authentication & Credentials
      </h3>
      {identity.credentials.length === 0 ? (
        <p className="text-sm text-slate-500">No active credentials found.</p>
      ) : (
        <div className="space-y-3">
          {identity.credentials.map(cred => (
            <div key={cred.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex items-center gap-3">
                {cred.type === "API Key" ? <Key size={16} className="text-slate-400" /> : cred.type === "OAuth Connection" ? <Link size={16} className="text-slate-400" /> : <Cpu size={16} className="text-slate-400" />}
                <div><p className="text-sm font-bold text-slate-900 dark:text-white">{cred.name}</p><p className="text-xs text-slate-500">{cred.type} • Expires: {new Date(cred.expiresAt).toLocaleDateString()}</p></div>
              </div>
              <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider ${cred.status === "Active" ? "bg-emerald-100 text-emerald-700" : cred.status === "Expiring Soon" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{cred.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}