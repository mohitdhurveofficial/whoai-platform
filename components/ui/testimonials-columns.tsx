"use client";

import React from "react";
import { motion } from "motion/react";

export interface Testimonial {
  text: string;
  image: string;
  name: string;
  role: string;
}

export const TestimonialsColumn = (props: {
  className?: string;
  testimonials: Testimonial[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{ translateY: "-50%" }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[...new Array(2).fill(0)].map((_, index) => (
          <React.Fragment key={index}>
            {props.testimonials.map(({ text, image, name, role }, i) => (
              <div
                className="w-full max-w-xs rounded-2xl border border-[#E6EBF1] bg-white p-8 shadow-[0_10px_28px_rgba(10,37,64,0.06)]"
                key={i}
              >
                <p className="text-[15px] leading-relaxed text-[#425466]">{text}</p>
                <div className="mt-5 flex items-center gap-3">
                  <img
                    width={40}
                    height={40}
                    src={image}
                    alt={name}
                    loading="lazy"
                    className="h-10 w-10 rounded-full object-cover"
                  />
                  <div className="flex flex-col">
                    <div className="text-[14px] font-semibold leading-5 tracking-tight text-[#0A2540]">
                      {name}
                    </div>
                    <div className="text-[13px] leading-5 tracking-tight text-[#8792A2]">
                      {role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </React.Fragment>
        ))}
      </motion.div>
    </div>
  );
};

/* -----------------------------------------------------------------------------
 * WHOAI testimonials section — social proof for the AI FinOps control plane.
 * -------------------------------------------------------------------------- */

const TESTIMONIALS: Testimonial[] = [
  {
    text: "WHOAI caught a runaway agent before it burned through our monthly budget overnight. The kill switch alone paid for the year.",
    image: "https://randomuser.me/api/portraits/women/44.jpg",
    name: "Maya Chen",
    role: "VP Engineering, Lumen AI",
  },
  {
    text: "For the first time we see exactly which agent and which model is costing us what — in real time, not at invoice time.",
    image: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Okafor",
    role: "Head of Platform, Northwind",
  },
  {
    text: "Hard budget caps that actually enforce. Our finance team finally trusts how we're spending on AI.",
    image: "https://randomuser.me/api/portraits/women/68.jpg",
    name: "Priya Nair",
    role: "Director of FinOps, Cobalt",
  },
  {
    text: "Setup took five minutes. One base-URL change and every call is metered, logged, and governed.",
    image: "https://randomuser.me/api/portraits/men/14.jpg",
    name: "Lucas Romero",
    role: "Staff Engineer, Vela",
  },
  {
    text: "Anomaly alerts hit Slack the moment spend spiked 400%. We fixed it before it ever reached the bill.",
    image: "https://randomuser.me/api/portraits/women/12.jpg",
    name: "Sarah Kim",
    role: "SRE Lead, Parallel",
  },
  {
    text: "BYOK was non-negotiable. Our keys never leave our perimeter — and we still get complete visibility.",
    image: "https://randomuser.me/api/portraits/men/52.jpg",
    name: "Aaron Blake",
    role: "Security Lead, Ironclad",
  },
  {
    text: "We cut AI spend 31% by finding duplicate prompts and routing to cheaper models. WHOAI showed us where.",
    image: "https://randomuser.me/api/portraits/women/24.jpg",
    name: "Elena Vasquez",
    role: "ML Platform Lead, Drift",
  },
  {
    text: "The per-token attribution is incredible. No more guessing which team or feature is driving the cost.",
    image: "https://randomuser.me/api/portraits/men/76.jpg",
    name: "Tom Albright",
    role: "Engineering Manager, Hatch",
  },
  {
    text: "Going from no controls to hard enforcement across every provider took an afternoon.",
    image: "https://randomuser.me/api/portraits/women/90.jpg",
    name: "Nadia Hassan",
    role: "CTO, Meridian",
  },
];

const firstColumn = TESTIMONIALS.slice(0, 3);
const secondColumn = TESTIMONIALS.slice(3, 6);
const thirdColumn = TESTIMONIALS.slice(6, 9);

export function WhoaiTestimonials() {
  return (
    <section className="bg-white py-28">
      <div className="mx-auto max-w-[1100px] px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          viewport={{ once: true }}
          className="mx-auto flex max-w-[640px] flex-col items-center text-center"
        >
          <div className="rounded-full border border-[#E6EBF1] bg-white px-4 py-1 text-[13px] font-semibold text-[#FF6B00] shadow-sm">
            Testimonials
          </div>
          <h2 className="mt-5 text-[34px] font-bold tracking-[-0.02em] sm:text-[42px]">
            Teams trust WHOAI with their AI spend
          </h2>
          <p className="mt-4 text-[18px] leading-relaxed text-[#425466]">
            From seed-stage agents to fleets in production — here&apos;s what teams say after
            putting WHOAI on the critical path.
          </p>
        </motion.div>

        <div className="mt-14 flex justify-center gap-6 [mask-image:linear-gradient(to_bottom,transparent,black_18%,black_82%,transparent)] max-h-[640px] overflow-hidden">
          <TestimonialsColumn testimonials={firstColumn} duration={17} />
          <TestimonialsColumn testimonials={secondColumn} className="hidden md:block" duration={21} />
          <TestimonialsColumn testimonials={thirdColumn} className="hidden lg:block" duration={19} />
        </div>
      </div>
    </section>
  );
}
