"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

/* -----------------------------------------------------------------------------
 * WHOAI model providers shown in the trust marquee.
 * -------------------------------------------------------------------------- */

const WHOAI_PROVIDERS = [
  "OpenAI",
  "Anthropic",
  "Google",
  "xAI",
  "DeepSeek",
  "Meta",
  "Alibaba",
  "Mistral",
];

function ProviderRow({ providers, copy = false }: { providers: string[]; copy?: boolean }) {
  return (
    <div className="flex items-center gap-x-10 sm:gap-x-12" aria-hidden={copy || undefined}>
      {providers.map((name, i) => (
        <span
          key={`${copy ? "c-" : ""}${name}-${i}`}
          className="whitespace-nowrap text-[15px] sm:text-lg font-semibold text-[#697386] select-none transition-colors duration-300 hover:text-[#0A2540]"
        >
          {name}
        </span>
      ))}
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * CANVAS STAGGERED PHYSICS ENGINE
 * Calibrated outward expansion ripple: extremely smooth and slightly relaxed
 * to feel cohesive, satisfyingly responsive, and visually distinct.
 * -------------------------------------------------------------------------- */

type Pixel = {
  x: number;
  y: number;
  color: string;
  ctx: CanvasRenderingContext2D;
  speed: number;
  size: number;
  sizeStep: number;
  minSize: number;
  maxSizeInt: number;
  maxSize: number;
  delay: number;
  counter: number;
  counterStep: number;
  isIdle: boolean;
  isReverse: boolean;
  isShimmer: boolean;
  draw: () => void;
  appear: () => void;
  disappear: () => void;
  shimmer: () => void;
};

function createPixel(
  ctx: CanvasRenderingContext2D,
  canvas: HTMLCanvasElement,
  x: number,
  y: number,
  color: string,
  baseSpeed: number,
  delay: number
): Pixel {
  const rand = (min: number, max: number) => Math.random() * (max - min) + min;

  const p: Pixel = {
    x, y, color, ctx,
    speed: rand(0.08, 0.4) * baseSpeed,
    size: 0,
    sizeStep: rand(0.12, 0.28),
    minSize: 0.5,
    maxSizeInt: 2,
    maxSize: rand(0.5, 2),
    delay,
    counter: 0,
    counterStep: rand(1.8, 3.2) + (canvas.width + canvas.height) * 0.008,
    isIdle: false,
    isReverse: false,
    isShimmer: false,
    draw() {
      const offset = p.maxSizeInt * 0.5 - p.size * 0.5;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x + offset, p.y + offset, p.size, p.size);
    },
    appear() {
      p.isIdle = false;
      if (p.counter <= p.delay) {
        p.counter += p.counterStep;
        return;
      }
      if (p.size >= p.maxSize) p.isShimmer = true;
      if (p.isShimmer) p.shimmer();
      else p.size += p.sizeStep;
      p.draw();
    },
    disappear() {
      p.isShimmer = false;
      p.counter = 0;
      if (p.size <= 0) {
        p.isIdle = true;
        return;
      }
      p.size -= 0.1;
      p.draw();
    },
    shimmer() {
      if (p.size >= p.maxSize) p.isReverse = true;
      else if (p.size <= p.minSize) p.isReverse = false;
      if (p.isReverse) p.size -= p.speed;
      else p.size += p.speed;
    },
  };

  return p;
}

type PixelCanvasProps = {
  colors: string[];
  gap?: number;
  speed?: number;
};

function PixelCanvas({ colors, gap = 5, speed = 30 }: PixelCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const pixelsRef = useRef<Pixel[]>([]);
  const animationRef = useRef<number>(0);
  const lastFrameRef = useRef(0);
  const reducedMotionRef = useRef(false);

  const init = useCallback(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap || colors.length === 0) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { width, height } = wrap.getBoundingClientRect();
    const w = Math.floor(width);
    const h = Math.floor(height);
    canvas.width = w;
    canvas.height = h;
    canvas.style.width = `${w}px`;
    canvas.style.height = `${h}px`;

    const effectiveSpeed = reducedMotionRef.current ? 0 : Math.min(speed, 100) * 0.001;
    const pixels: Pixel[] = [];

    for (let x = 0; x < w; x += gap) {
      for (let y = 0; y < h; y += gap) {
        const color = colors[Math.floor(Math.random() * colors.length)];
        const dx = x - w / 2;
        const dy = y - h / 2;
        const delay = reducedMotionRef.current ? 0 : Math.sqrt(dx * dx + dy * dy) * 0.65;
        pixels.push(createPixel(ctx, canvas, x, y, color, effectiveSpeed, delay));
      }
    }

    pixelsRef.current = pixels;
  }, [colors, gap, speed]);

  const animate = useCallback((mode: "appear" | "disappear") => {
    cancelAnimationFrame(animationRef.current);
    const frameInterval = 1000 / 60;

    const loop = () => {
      animationRef.current = requestAnimationFrame(loop);

      const now = performance.now();
      const elapsed = now - lastFrameRef.current;
      if (elapsed < frameInterval) return;
      lastFrameRef.current = now - (elapsed % frameInterval);

      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      if (!canvas || !ctx) return;

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const pixels = pixelsRef.current;
      for (const pixel of pixels) pixel[mode]();

      if (pixels.every((p) => p.isIdle)) {
        cancelAnimationFrame(animationRef.current);
      }
    };

    animationRef.current = requestAnimationFrame(loop);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    lastFrameRef.current = performance.now();
    init();

    const resizeObserver = new ResizeObserver(() => init());
    if (wrapRef.current) resizeObserver.observe(wrapRef.current);

    animate("appear");

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationRef.current);
    };
  }, [init, animate]);

  return (
    <div ref={wrapRef} className="absolute inset-0 overflow-hidden">
      <canvas ref={canvasRef} className="block w-full h-full" />
    </div>
  );
}

/* -----------------------------------------------------------------------------
 * WHOAI PIXEL HERO
 * Light-theme hero with an animated pixel-canvas field, tinted from the
 * brand tokens (--primary orange + --muted-foreground gray).
 * -------------------------------------------------------------------------- */

interface PixelHeroProps {
  word1?: string;
  word2?: string;
  description?: string;
  tagline?: string;
  primaryCta?: string;
  primaryHref?: string;
  secondaryCta?: string;
  secondaryHref?: string;
  eyebrow?: string;
  providers?: string[];
}

export function PixelHero({
  word1 = "Control",
  word2 = "AI spend.",
  description = "Everyone else shows you the bill. WHOAI enforces it — real-time per-token cost, hard budget caps, and an instant kill switch for runaway agents.",
  tagline = "BYOK · OpenAI-compatible · Live in 5 minutes",
  primaryCta = "Start free",
  primaryHref = "/auth/signup",
  secondaryCta = "Book a demo",
  secondaryHref = "/demo",
  eyebrow = "Works with every major model provider",
  providers = WHOAI_PROVIDERS,
}: PixelHeroProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [themeColors, setThemeColors] = useState<string[]>([]);

  useEffect(() => {
    if (typeof document === "undefined") return;

    // Read the resolved brand colors so the canvas matches the theme tokens.
    const div = document.createElement("div");
    document.body.appendChild(div);
    div.className = "text-muted-foreground";
    const muted = getComputedStyle(div).color;
    div.className = "text-primary";
    const primary = getComputedStyle(div).color;
    document.body.removeChild(div);

    // Mostly muted gray with a subtle orange accent.
    setThemeColors([muted, muted, muted, muted, primary]);

    const loadTimer = setTimeout(() => setIsLoaded(true), 50);
    return () => clearTimeout(loadTimer);
  }, []);

  return (
    <section className="relative w-full min-h-[100dvh] bg-white flex flex-col justify-between md:justify-center md:gap-6 py-10 md:py-0 px-4 sm:px-6 overflow-hidden select-none isolate">
      <style>{`
        @keyframes wa-pixel-marquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .wa-pixel-marquee { animation: wa-pixel-marquee 30s linear infinite; }
        @media (prefers-reduced-motion: reduce) { .wa-pixel-marquee { animation: none; } }
      `}</style>

      {/* Pixel canvas background + vignette fading into the white page */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {themeColors.length > 0 && <PixelCanvas colors={themeColors} gap={6} speed={30} />}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,#ffffff_80%)] pointer-events-none" />
      </div>

      {/* Headline */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center mt-24 sm:mt-0 w-full">
        <h1 className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 px-1 w-full flex-wrap text-[2.8rem] xs:text-[3.4rem] sm:text-6xl md:text-7xl lg:text-8xl leading-[1.05] font-bold tracking-tight text-[#0A2540]">
          <span>{word1}</span>
          <span className="orange-gradient font-extrabold">{word2}</span>
        </h1>
      </div>

      {/* Description + tagline + mobile marquee */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center my-auto md:my-0 px-1 w-full">
        <p className="max-w-[92%] sm:max-w-xl md:max-w-2xl text-[15px] sm:text-lg md:text-xl leading-relaxed text-[#425466]">
          {description}
        </p>
        {tagline && (
          <p className="mt-6 text-[13px] font-medium text-[#8792A2]">{tagline}</p>
        )}

        {/* Mobile-only provider marquee */}
        <div className="block md:hidden w-full mt-12">
          <div className="text-[11px] uppercase tracking-[0.16em] text-[#8792A2] font-semibold mb-4">
            {eyebrow}
          </div>
          <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
            <div className="flex w-max gap-x-10 wa-pixel-marquee">
              <ProviderRow providers={providers} />
              <ProviderRow providers={providers} copy />
            </div>
          </div>
        </div>
      </div>

      {/* CTA Row */}
      <div
        className={cn(
          "relative z-10 flex flex-row items-center justify-center gap-3 mt-6 md:mt-8 transition-all duration-1000",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "300ms" }}
      >
        <Link
          href={primaryHref}
          className="inline-flex h-11 md:h-12 items-center justify-center gap-2 rounded-xl bg-gradient-to-b from-[#FF7A1A] to-[#FF6B00] px-6 md:px-8 text-sm md:text-[15px] font-semibold text-white shadow-[0_2px_4px_rgba(255,107,0,0.25),0_12px_24px_rgba(255,107,0,0.18)] ring-1 ring-[#FF6B00]/30 transition-transform duration-200 hover:scale-[1.02] active:scale-[0.98]"
        >
          {primaryCta} <ArrowRight className="h-4 w-4" />
        </Link>
        <Link
          href={secondaryHref}
          className="inline-flex h-11 md:h-12 items-center justify-center rounded-xl border border-[#E6EBF1] bg-white px-6 md:px-8 text-sm md:text-[15px] font-semibold text-[#0A2540] shadow-sm transition-all duration-200 hover:border-[#CBD5E1] hover:scale-[1.02] active:scale-[0.98]"
        >
          {secondaryCta}
        </Link>
      </div>

      {/* Desktop-only provider marquee */}
      <div
        className={cn(
          "hidden md:flex absolute bottom-10 left-0 right-0 w-full z-10 flex-col items-center justify-center gap-4 transition-all duration-1000",
          isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
        )}
        style={{ transitionDelay: "450ms" }}
      >
        <span className="text-xs uppercase tracking-[0.16em] text-[#8792A2] font-semibold">
          {eyebrow}
        </span>
        <div className="relative w-full max-w-5xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,white_15%,white_85%,transparent)]">
          <div className="flex w-max gap-x-12 wa-pixel-marquee">
            <ProviderRow providers={providers} />
            <ProviderRow providers={providers} copy />
          </div>
        </div>
      </div>
    </section>
  );
}
