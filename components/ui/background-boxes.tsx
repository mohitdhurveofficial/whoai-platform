"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

/**
 * Animated skewed grid. Hovering a cell flashes a brand-tinted color.
 * Reduced from the reference's 150×100 (=15,000 nodes) to a performant
 * 36×22 so it can sit behind real content without jank. Light-theme borders.
 */

const COLORS = [
  "rgb(255 107 0)", // brand orange
  "rgb(255 138 76)", // orange-light
  "rgb(125 211 252)", // sky-300
  "rgb(147 197 253)", // blue-300
  "rgb(165 180 252)", // indigo-300
  "rgb(134 239 172)", // green-300
  "rgb(253 224 71)", // yellow-300
];

const ROWS = 36;
const COLS = 22;

// Precompute a stable hover color per cell at module load (NOT during render)
// so the component stays pure. Hover colors are client-only interaction state,
// so any SSR/client difference never reaches the rendered DOM.
const CELL_COLORS: string[][] = Array.from({ length: ROWS }, () =>
  Array.from({ length: COLS }, () => COLORS[Math.floor(Math.random() * COLORS.length)])
);

export const BoxesCore = ({ className, ...rest }: { className?: string }) => {
  const rows = new Array(ROWS).fill(1);
  const cols = new Array(COLS).fill(1);

  return (
    <div
      style={{
        transform: `translate(-40%,-60%) skewX(-48deg) skewY(14deg) scale(0.675) rotate(0deg) translateZ(0)`,
      }}
      className={cn(
        "absolute left-1/4 -top-1/4 z-0 flex h-full w-full -translate-x-1/2 -translate-y-1/2 p-4",
        className
      )}
      {...rest}
    >
      {rows.map((_, i) => (
        <motion.div key={`row${i}`} className="relative h-8 w-16 border-l border-[#0A2540]/[0.08]">
          {cols.map((_, j) => (
            <motion.div
              whileHover={{ backgroundColor: CELL_COLORS[i][j], transition: { duration: 0 } }}
              animate={{ transition: { duration: 2 } }}
              key={`col${j}`}
              className="relative h-8 w-16 border-r border-t border-[#0A2540]/[0.08]"
            >
              {j % 2 === 0 && i % 2 === 0 ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  strokeWidth="1.5"
                  stroke="currentColor"
                  className="pointer-events-none absolute -top-[14px] -left-[22px] h-6 w-10 stroke-[1px] text-[#0A2540]/[0.10]"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6" />
                </svg>
              ) : null}
            </motion.div>
          ))}
        </motion.div>
      ))}
    </div>
  );
};

export const Boxes = React.memo(BoxesCore);
