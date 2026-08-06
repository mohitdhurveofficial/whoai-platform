import { KeyRound, Tag, Lock, ShieldCheck, Zap, Server } from "lucide-react";

/* -----------------------------------------------------------------------------
 * WHOAI TRUST BADGES
 * A flat, editorial trust strip (no cards/shadows) for placement near the hero
 * and pricing CTA. Surfaces the launch trust cues prospects look for before
 * they sign up: BYOK, no markup, encryption, enforcement, compatibility,
 * self-host. Neutral colors so it reads on both the navy and warm palettes.
 * -------------------------------------------------------------------------- */

const BADGES = [
  { icon: KeyRound, label: "BYOK — your keys" },
  { icon: Tag, label: "No token markup" },
  { icon: Lock, label: "Encrypted at rest" },
  { icon: ShieldCheck, label: "Hard budget enforcement" },
  { icon: Zap, label: "OpenAI-compatible" },
  { icon: Server, label: "Self-host available" },
];

export function TrustBadges({ className = "" }: { className?: string }) {
  return (
    <div
      className={`flex flex-wrap items-center justify-center gap-x-6 gap-y-3 ${className}`}
      aria-label="Trust and security highlights"
    >
      {BADGES.map((b) => (
        <span
          key={b.label}
          className="inline-flex items-center gap-2 text-[13px] font-medium text-[#475569]"
        >
          <b.icon className="h-4 w-4 shrink-0 text-[#FF6B00]" />
          {b.label}
        </span>
      ))}
    </div>
  );
}

export default TrustBadges;
