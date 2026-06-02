"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

const avatars = [
  "from-orange-300 to-orange-600",
  "from-zinc-200 to-zinc-500",
  "from-amber-200 to-orange-500",
  "from-neutral-700 to-black",
];

export default function Hero() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="relative z-10 pl-0 lg:pl-24"
    >
      <div className="inline-flex h-8 items-center gap-2 rounded-full border border-black/5 bg-white px-3 text-[13px] font-semibold text-[#071126] shadow-sm">
        <span className="h-2 w-2 rounded-full bg-sky-500 shadow-[0_0_0_4px_rgba(14,165,233,0.12)]" />
        The WhoAI Operating System
      </div>

      <h1 className="mt-7 max-w-[620px] text-[48px] font-black leading-[1.04] tracking-[-0.055em] text-[#071126] sm:text-[58px] lg:text-[63px]">
        Enterprise OS For
        <br />
        Managing <span className="orange-gradient">Autonomous</span>
        <br />
        <span className="orange-gradient">AI Workers</span>
      </h1>

      <p className="mt-6 max-w-[520px] text-[18px] font-medium leading-[1.7] text-[#071126]">
        Deploy, govern, and scale autonomous AI workers with enterprise-grade 
        identity, permissions, policies, and approval workflows. Complete control. 
        Full compliance. Unlimited scale.
      </p>

      <div className="mt-7 flex flex-col gap-4 sm:flex-row">
        <Link
          href="/dashboard"
          className="shadow-button-dark inline-flex h-[54px] items-center justify-center gap-3 rounded-full bg-[#071126] px-8 text-[14px] font-bold text-white transition hover:-translate-y-0.5"
        >
          Enter the Control Center
          <ArrowRight size={18} className="text-sky-500" />
        </Link>
        <Link
          href="#"
          className="shadow-button-light inline-flex h-[54px] items-center justify-center rounded-full border border-black/6 bg-white px-8 text-[14px] font-bold text-[#071126] transition hover:-translate-y-0.5"
        >
          Request Demo
        </Link>
      </div>

      <div className="mt-7 flex items-center gap-5">
        <div className="flex -space-x-3">
          {avatars.map((avatar, index) => (
            <div
              key={avatar}
              className={`shadow-logo-card h-8 w-8 rounded-full border-2 border-[#f8f5ef] bg-gradient-to-br ${avatar}`}
              aria-label={`Trusted team avatar ${index + 1}`}
            />
          ))}
        </div>
        <p className="text-[14px] font-medium text-[#071126]">
          Trusted by AI-first enterprises
        </p>
      </div>
    </motion.div>
  );
}