"use client";

import { motion } from "framer-motion";
import {
  Bot,
  BrainCircuit,
  Cable,
  Hexagon,
  Network,
  Sparkles,
} from "lucide-react";

const logos = [
  { name: "OpenAI", icon: Sparkles },
  { name: "LangChain", icon: Cable },
  { name: "CrewAI", icon: Bot },
  { name: "Anthropic", icon: Hexagon },
  { name: "AutoGen", icon: Network },
  { name: "Hugging Face", icon: BrainCircuit },
];

export default function TrustedBy() {
  return (
    <section className="px-4 pb-4 pt-7 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.4 }}
        className="premium-panel mx-auto max-w-[1368px] rounded-[22px] px-8 py-5"
      >
        <p className="text-center text-[11px] font-black uppercase tracking-[0.36em] text-[#071126]/38">
          Trusted by innovative AI teams
        </p>

        <div className="mt-5 grid grid-cols-2 items-center gap-3 text-center sm:grid-cols-3 lg:grid-cols-6">
          {logos.map((logo) => {
            const Icon = logo.icon;

            return (
              <div
                key={logo.name}
                className="shadow-logo-card flex min-h-14 items-center justify-center gap-3 rounded-2xl border border-black/5 bg-white/72 px-4 text-[#071126] transition hover:-translate-y-0.5 hover:bg-white"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#071126] text-white">
                  <Icon size={17} strokeWidth={2.2} />
                </span>
                <span className="text-[18px] font-black tracking-[-0.04em]">
                  {logo.name}
                </span>
              </div>
            );
          })}
        </div>
      </motion.div>
    </section>
  );
}
