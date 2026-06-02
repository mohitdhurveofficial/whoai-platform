"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ShieldCheck, UsersRound, Zap } from "lucide-react";

const metrics = [
  {
    icon: UsersRound,
    value: "1M+",
    label: "Actions Governed",
    color: "text-orange-500",
  },
  {
    icon: ShieldCheck,
    value: "99.99%",
    label: "Uptime & Reliability",
    color: "text-emerald-500",
  },
  {
    icon: Zap,
    value: "50ms",
    label: "Policy Evaluation",
    color: "text-violet-600",
  },
  {
    icon: CheckCircle2,
    value: "100%",
    label: "Audit Coverage",
    color: "text-blue-600",
  },
];

export default function Metrics() {
  return (
    <section className="px-4 py-0 sm:px-6">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="premium-panel mx-auto grid max-w-[1290px] overflow-hidden rounded-[18px] sm:grid-cols-2 lg:grid-cols-4"
      >
        {metrics.map((metric) => {
          const Icon = metric.icon;

          return (
            <div
              key={metric.label}
              className="flex min-h-[96px] items-center justify-center gap-6 border-black/10 px-6 py-5 text-center lg:border-r lg:last:border-r-0"
            >
              <div className={metric.color}>
                <Icon size={42} strokeWidth={1.9} />
              </div>
              <div className="text-left">
                <h3 className={`text-[34px] font-black leading-none tracking-[-0.04em] ${metric.color}`}>{metric.value}</h3>
                <p className="mt-2 text-[13px] font-medium text-[#071126]">
                  {metric.label}
                </p>
              </div>
            </div>
          );
        })}
      </motion.div>
    </section>
  );
}
