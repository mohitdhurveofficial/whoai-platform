"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Eye, Loader2, RotateCcw } from "lucide-react";

/**
 * Row controls for the alerts table.
 *
 * The table itself stays a server component (the alert data is a plain Prisma
 * read); only these buttons need interactivity. They are always visible rather
 * than revealed on hover — a touch device has no hover state, so hover-gated
 * controls are unreachable on mobile and undiscoverable by keyboard.
 */
export function AlertRowActions({
  alertId,
  resolved,
  agentId,
}: {
  alertId: string;
  resolved: boolean;
  agentId: string | null;
}) {
  const router = useRouter();
  const [working, setWorking] = useState(false);
  const [failed, setFailed] = useState(false);

  const setResolved = async (next: boolean) => {
    setWorking(true);
    setFailed(false);
    try {
      const res = await fetch("/api/alerts", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: alertId, resolved: next }),
      });
      if (!res.ok) throw new Error();
      // Re-fetch the server component so the status cell reflects the change.
      router.refresh();
    } catch {
      setFailed(true);
    } finally {
      setWorking(false);
    }
  };

  return (
    <div className="flex items-center justify-end gap-1">
      {failed && <span className="mr-1 text-[11px] font-medium text-red-600">Failed</span>}

      <button
        onClick={() => setResolved(!resolved)}
        disabled={working}
        aria-label={resolved ? "Reopen alert" : "Resolve alert"}
        title={resolved ? "Reopen" : "Resolve"}
        className={`inline-flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] ${
          resolved
            ? "text-[#888888] hover:bg-[#FAF7F3] hover:text-[#111111]"
            : "text-[#888888] hover:bg-emerald-50 hover:text-emerald-600"
        }`}
      >
        {working ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : resolved ? (
          <RotateCcw className="h-4 w-4" />
        ) : (
          <CheckCircle2 className="h-4 w-4" />
        )}
        <span className="hidden sm:inline">{resolved ? "Reopen" : "Resolve"}</span>
      </button>

      {agentId && (
        <Link
          href={`/agents/${agentId}`}
          aria-label="View agent"
          title="View agent"
          className="inline-flex items-center gap-1.5 rounded px-2 py-1 text-[12px] font-medium text-[#888888] transition-colors hover:bg-[#FAF7F3] hover:text-[#FF6B00] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00]"
        >
          <Eye className="h-4 w-4" />
          <span className="hidden sm:inline">Agent</span>
        </Link>
      )}
    </div>
  );
}
