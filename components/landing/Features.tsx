"use client";

import { motion } from "framer-motion";
import {
  BarChart3,
  FileSearch,
  Network,
  Radar,
  ShieldCheck,
  UsersRound,
} from "lucide-react";

const features = [
  {
    icon: ShieldCheck,
    title: "Identity & Auth",
    description: "Enterprise-grade identity for each AI worker",
    color: "text-sky-500 bg-sky-50",
  },
  {
    icon: Radar,
    title: "Permissions Engine",
    description: "Granular access control and resource management",
    color: "text-violet-500 bg-violet-50",
  },
  {
    icon: UsersRound,
    title: "Approval Workflows",
    description: "Human-in-the-loop for high-risk decisions",
    color: "text-emerald-500 bg-emerald-50",
  },
  {
    icon: FileSearch,
    title: "Audit & Compliance",
    description: "Immutable logs for compliance and investigations",
    color: "text-orange-500 bg-orange-50",
  },
  {
    icon: BarChart3,
    title: "Intelligence Hub",
    description: "Real-time metrics and decision analytics",
    color: "text-blue-600 bg-blue-50",
  },
  {
    icon: Network,
    title: "Policy Studio",
    description: "Enterprise policy creation and versioning",
    color: "text-cyan-500 bg-cyan-50",
  },
];

export default function Features() {
  return (
    <section className="px-4 pb-7 pt-3 sm:px-6">
      <div className="mx-auto max-w-[1280px]">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mx-auto max-w-4xl text-center"
        >
          <h2 className="text-[28px] font-black leading-tight tracking-[-0.035em] text-[#071126] sm:text-[32px]">
            The Complete Platform For{" "}
            <span className="orange-gradient">Managing AI Workers</span>
          </h2>
          <p className="mt-2 text-[14px] font-medium text-[#071126]">
            Deploy autonomous agents with enterprise governance, compliance, and audit built-in
          </p>
        </motion.div>

        <div className="mt-7 grid gap-5 md:grid-cols-3 lg:grid-cols-6">
          {features.map((feature, index) => {
            const Icon = feature.icon;

            return (
              <motion.article
                key={feature.title}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.05 }}
                className="group min-h-[190px] rounded-[18px] border border-black/5 bg-white/82 px-5 py-7 text-center shadow-[0_14px_34px_rgba(7,17,38,0.055),inset_0_1px_0_rgba(255,255,255,0.85)] transition hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(7,17,38,0.1)]"
              >
                <div className={`mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] ${feature.color}`}>
                  <Icon size={34} strokeWidth={1.9} />
                </div>
                <h3 className="mt-6 text-[16px] font-black text-[#071126]">{feature.title}</h3>
                <p className="mt-3 text-[13px] font-medium leading-5 text-[#071126]">
                  {feature.description}
                </p>
              </motion.article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
