"use client";

import { motion } from "framer-motion";
import {
  Bot,
  CheckCircle2,
  UserRound,
  TriangleAlert,
  ShieldCheck,
} from "lucide-react";

const steps = [
  {
    icon: Bot,
    title: "AI Agent",
    detail: "Requests an action",
  },
  {
    icon: ShieldCheck,
    title: "Policy Engine",
    detail: "Evaluates policies",
  },
  {
    icon: TriangleAlert,
    title: "Risk Detection",
    detail: "Assesses risk level",
  },
  {
    icon: UserRound,
    title: "Human Approval",
    detail: "Review & approve",
    highlight: true,
  },
  {
    icon: CheckCircle2,
    title: "Execute Action",
    detail: "Action is performed",
  },
];

export default function Workflow() {
  return (
    <motion.div
      animate={{ y: [0, -10, 0] }}
      transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
      className="relative z-10 mx-auto w-full max-w-[292px] lg:mr-28"
    >
      <div className="relative space-y-[17px]">
        <div className="absolute bottom-10 left-1/2 top-10 -translate-x-1/2 border-l-[5px] border-dotted border-emerald-400" />

          {steps.map((step, index) => {
            const Icon = step.icon;

            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.08, duration: 0.4 }}
                className={`relative min-h-[78px] rounded-[16px] border px-7 py-4 shadow-[0_16px_38px_rgba(7,17,38,0.11),inset_0_1px_0_rgba(255,255,255,0.85)] transition hover:-translate-y-1 hover:shadow-[0_22px_54px_rgba(7,17,38,0.14)] ${
                  step.highlight
                    ? "border-orange-300 bg-orange-50"
                    : "border-black/5 bg-white"
                }`}
              >
                <div className="flex items-center gap-6">
                  <div
                    className={`z-10 flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${
                      step.highlight
                        ? "bg-orange-100 text-orange-600"
                        : index === 4
                          ? "bg-emerald-100 text-emerald-500"
                          : index === 2
                            ? "bg-orange-100 text-orange-500"
                            : "bg-white text-[#071126]"
                    }`}
                  >
                    <Icon size={25} strokeWidth={2.3} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-[15px] font-black text-[#071126]">{step.title}</h3>
                    <p className="mt-1 text-[12px] font-semibold text-[#071126]/70">
                      {step.detail}
                    </p>
                  </div>
                </div>
              </motion.div>
            );
          })}
      </div>
    </motion.div>
  );
}
