import React from "react";
import { Lock, RefreshCw, TriangleAlert } from "lucide-react";
import type { AIIdentity } from "./types";

export function WorkerSecretsCard({ identity }: { identity: AIIdentity }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm h-full">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
        <Lock size={16} className="text-emerald-500" /> Managed Secrets
      </h3>
      {identity.secrets.length === 0 ? (
        <p className="text-sm text-slate-500">No managed secrets found.</p>
      ) : (
        <div className="space-y-3">
          {identity.secrets.map(secret => (
            <div key={secret.id} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50">
              <div className="flex flex-col">
                <p className="text-sm font-bold text-slate-900 dark:text-white font-mono">{secret.name}</p>
                <p className="text-xs text-slate-500 flex items-center gap-1 mt-1"><RefreshCw size={10} /> Last Rotated: {new Date(secret.lastRotated).toLocaleDateString()}</p>
              </div>
              <span className={`flex items-center gap-1 text-[10px] uppercase font-bold px-2 py-1 rounded-md tracking-wider ${secret.status === "Healthy" ? "bg-emerald-100 text-emerald-700" : secret.status === "Needs Rotation" ? "bg-amber-100 text-amber-700" : "bg-rose-100 text-rose-700"}`}>{secret.status === "Healthy" ? <Lock size={10}/> : <TriangleAlert size={10}/>}{secret.status}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}