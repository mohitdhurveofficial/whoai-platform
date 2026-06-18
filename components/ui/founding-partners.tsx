"use client";

import Link from "next/link";
import { ArrowRight, Gift, MessageSquare, Tag } from "lucide-react";
import { Reveal, Stagger, StaggerItem } from "@/app/components/marketing/Motion";

/* -----------------------------------------------------------------------------
 * WHOAI FOUNDING PARTNERS
 * Honest, pre-launch social proof. Replaces fabricated testimonials: instead of
 * inventing customers, we frame WHOAI's launch as a founding-design-partner
 * program — true today, and it doubles as a lead magnet for the free teardown.
 * -------------------------------------------------------------------------- */

const PERKS = [
  {
    icon: Gift,
    t: "A free spend teardown",
    b: "We analyze your real agent traffic and show you exactly where the waste is — concrete savings, before you commit to anything.",
  },
  {
    icon: MessageSquare,
    t: "A direct line to the team",
    b: "Help shape the roadmap. Founding partners get a private channel, and their requests go to the front of the queue.",
  },
  {
    icon: Tag,
    t: "Launch pricing, locked in",
    b: "Lock today's pricing for the life of your account as we grow — your rate never moves out from under you.",
  },
];

export function FoundingPartners() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-[1100px] px-6">
        <Reveal className="mx-auto flex max-w-[680px] flex-col items-center text-center">
          <div className="rounded-full border border-[#E6EBF1] bg-white px-4 py-1 text-[13px] font-semibold text-[#FF6B00] shadow-sm">
            Founding design partners
          </div>
          <h2 className="mt-5 text-[34px] font-bold tracking-[-0.02em] sm:text-[42px]">
            Be one of the first to put a control plane on your AI spend
          </h2>
          <p className="mt-4 text-[18px] leading-relaxed text-[#425466]">
            WHOAI is launching with a small group of founding design partners. No invented
            logos here — just an honest offer to the teams who get in early.
          </p>
        </Reveal>

        <Stagger className="mt-14 grid gap-6 md:grid-cols-3">
          {PERKS.map((c) => (
            <StaggerItem
              key={c.t}
              hover
              className="rounded-2xl border border-[#E6EBF1] bg-white p-7 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]">
                <c.icon className="h-5 w-5" />
              </div>
              <h3 className="text-[18px] font-bold text-[#0A2540]">{c.t}</h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[#425466]">{c.b}</p>
            </StaggerItem>
          ))}
        </Stagger>

        <Reveal delay={0.1} className="mt-12 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link
            href="/teardown"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#FF6B00] px-7 py-3.5 text-[15px] font-semibold text-white shadow-[0_12px_30px_rgba(255,107,0,0.28)] transition-colors hover:bg-[#E85F00]"
          >
            Get your free spend teardown <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/auth/signup"
            className="inline-flex items-center justify-center rounded-lg border border-[#E6EBF1] bg-white px-7 py-3.5 text-[15px] font-semibold text-[#0A2540] shadow-sm transition-colors hover:border-[#CBD5E1]"
          >
            Start free
          </Link>
        </Reveal>
      </div>
    </section>
  );
}

export default FoundingPartners;
