"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, Clock3, CreditCard } from "lucide-react";

const assurances = [
  { label: "No credit card required", icon: CreditCard },
  { label: "Setup in 2 minutes", icon: Clock3 },
  { label: "Cancel anytime", icon: BadgeCheck },
];

export default function CTA() {
  return (
    <section className="px-4 pb-0 pt-4 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 26 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.3 }}
        className="dark-pattern shadow-premium mx-auto max-w-[1290px] overflow-hidden rounded-[24px] px-6 py-8 text-center text-white sm:px-10"
      >
        <h2 className="mx-auto max-w-3xl text-[36px] font-black leading-tight tracking-[-0.035em] sm:text-[40px]">
          Govern AI Before AI Governs You
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-[17px] font-medium leading-7 text-white/82">
          Join the future of AI governance. Start for free.
        </p>

        <div className="mt-6 flex flex-col justify-center gap-7 sm:flex-row">
          <Link
            href="/dashboard"
            className="shadow-button-orange inline-flex h-[48px] min-w-[210px] items-center justify-center gap-3 rounded-full bg-orange-500 px-7 text-[14px] font-black text-white transition hover:-translate-y-0.5"
          >
            Start Free Trial
            <ArrowRight size={18} />
          </Link>
          <Link
            href="#"
            className="shadow-button-light inline-flex h-[48px] min-w-[210px] items-center justify-center rounded-full border border-white/14 bg-white px-7 text-[14px] font-black text-black transition hover:-translate-y-0.5"
          >
            Book a Demo
          </Link>
        </div>

        <div className="mt-7 flex flex-col items-center justify-center gap-4 text-[13px] font-medium text-white/82 sm:flex-row sm:gap-28">
          {assurances.map((item) => {
            const Icon = item.icon;

            return (
            <div key={item.label} className="flex items-center gap-2">
              <Icon size={15} />
              {item.label}
            </div>
          );
          })}
        </div>
      </motion.div>
    </section>
  );
}
