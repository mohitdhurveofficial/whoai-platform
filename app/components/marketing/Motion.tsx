"use client";

/**
 * Marketing motion primitives — small, composable Framer Motion (`motion`)
 * wrappers used as client entry points inside server-rendered pages.
 *
 * The children passed in stay server-rendered (good for SEO/LCP); only the
 * animation shell hydrates on the client. Every primitive honours
 * `prefers-reduced-motion`.
 */

import {
  motion,
  useInView,
  useReducedMotion,
  useMotionValue,
  useSpring,
  animate,
  type Variants,
} from "motion/react";
import Link from "next/link";
import {
  useEffect,
  useRef,
  useState,
  type ReactNode,
  type MouseEvent,
} from "react";

// Shared "ease-out-expo" curve — matches the existing wa-rise CSS animations.
const EASE: [number, number, number, number] = [0.22, 1, 0.36, 1];

/* -------------------------------------------------------------------------- */
/* Reveal — fade + rise the moment the element scrolls into view              */
/* -------------------------------------------------------------------------- */

export function Reveal({
  children,
  className,
  delay = 0,
  y = 24,
  x = 0,
}: {
  children: ReactNode;
  className?: string;
  /** entrance delay, seconds */
  delay?: number;
  /** distance (px) to travel up from */
  y?: number;
  /** distance (px) to travel horizontally from (negative = from left) */
  x?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y, x }}
      whileInView={{ opacity: 1, y: 0, x: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.6, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* Stagger — parent that releases its children one after another              */
/* -------------------------------------------------------------------------- */

export function Stagger({
  children,
  className,
  stagger = 0.08,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  delay?: number;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      className={className}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{
        hidden: {},
        show: {
          transition: {
            staggerChildren: reduce ? 0 : stagger,
            delayChildren: delay,
          },
        },
      }}
    >
      {children}
    </motion.div>
  );
}

export function StaggerItem({
  children,
  className,
  /** add a springy hover lift — for cards */
  hover = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
}) {
  const reduce = useReducedMotion();
  const variants: Variants = {
    hidden: reduce ? { opacity: 0 } : { opacity: 0, y: 22 },
    show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: EASE } },
  };
  return (
    <motion.div
      className={className}
      variants={variants}
      whileHover={hover && !reduce ? { y: -6 } : undefined}
      transition={{ type: "spring", stiffness: 320, damping: 22 }}
    >
      {children}
    </motion.div>
  );
}

/* -------------------------------------------------------------------------- */
/* CountUp — animate a number from 0 to its value when it enters view         */
/* -------------------------------------------------------------------------- */

export function CountUp({
  value,
  prefix = "",
  suffix = "",
  decimals = 0,
  duration = 1.8,
  className,
}: {
  value: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  duration?: number;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const [animated, setAnimated] = useState(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, value, {
      duration,
      ease: EASE,
      onUpdate: (v) => setAnimated(v),
    });
    return () => controls.stop();
  }, [inView, reduce, value, duration]);

  // Reduced motion (or SSR) shows the final value immediately.
  const current = reduce ? value : animated;
  const formatted =
    decimals > 0
      ? current.toFixed(decimals)
      : Math.round(current).toLocaleString("en-US");

  return (
    <span ref={ref} className={className}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* MagneticButton — a Next <Link> that leans toward the cursor + presses in   */
/* -------------------------------------------------------------------------- */

const MotionLink = motion.create(Link);

export function MagneticButton({
  href,
  className,
  children,
  strength = 0.3,
}: {
  href: string;
  className?: string;
  children: ReactNode;
  /** how far the button drifts toward the cursor (0–1) */
  strength?: number;
}) {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18, mass: 0.4 });
  const sy = useSpring(y, { stiffness: 260, damping: 18, mass: 0.4 });

  function handleMove(e: MouseEvent<HTMLAnchorElement>) {
    const el = ref.current;
    if (reduce || !el) return;
    const rect = el.getBoundingClientRect();
    x.set((e.clientX - (rect.left + rect.width / 2)) * strength);
    y.set((e.clientY - (rect.top + rect.height / 2)) * strength);
  }

  function reset() {
    x.set(0);
    y.set(0);
  }

  return (
    <MotionLink
      ref={ref}
      href={href}
      className={className}
      style={reduce ? undefined : { x: sx, y: sy }}
      onMouseMove={handleMove}
      onMouseLeave={reset}
      whileTap={reduce ? undefined : { scale: 0.96 }}
    >
      {children}
    </MotionLink>
  );
}
