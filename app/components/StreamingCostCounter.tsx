"use client";

import React, { useEffect, useRef, useState } from "react";
import { Zap, DollarSign } from "lucide-react";

interface StreamingCostCounterProps {
  /** Model being streamed */
  model: string;
  /** Input tokens (known at start) */
  inputTokens: number;
  /** Estimated output tokens */
  estimatedOutputTokens: number;
  /** Cost per 1K input tokens */
  inputPricePer1K: number;
  /** Cost per 1K output tokens */
  outputPricePer1K: number;
  /** Optional: callback when streaming ends with final cost */
  onComplete?: (finalCost: number, actualTokens: number) => void;
}

/**
 * Real-time streaming cost counter.
 * Shows cost accumulating live as tokens stream in.
 * Creates an unforgettable "money burning in real time" moment
 * that no competitor has.
 */
export function StreamingCostCounter({
  model,
  inputTokens,
  estimatedOutputTokens,
  inputPricePer1K,
  outputPricePer1K,
  onComplete,
}: StreamingCostCounterProps) {
  const [visible, setVisible] = useState(false);
  const [currentTokens, setCurrentTokens] = useState(0);
  const [startTime] = useState(Date.now());
  const [elapsedMs, setElapsedMs] = useState(0);
  const rafRef = useRef<number>(0);

  const inputCost = (inputTokens / 1000) * inputPricePer1K;
  const currentOutputCost = (currentTokens / 1000) * outputPricePer1K;
  const totalCost = inputCost + currentOutputCost;
  const estimatedTotalCost = inputCost + (estimatedOutputTokens / 1000) * outputPricePer1K;

  // Animate token count based on elapsed time (simulates real streaming)
  useEffect(() => {
    setVisible(true);
    const tick = () => {
      const elapsed = Date.now() - startTime;
      setElapsedMs(elapsed);
      // Assume tokens arrive at ~50 tokens/second (typical for LLM streaming)
      const estimatedCurrent = Math.min(Math.floor((elapsed / 1000) * 50), estimatedOutputTokens);
      setCurrentTokens(estimatedCurrent);
      if (estimatedCurrent < estimatedOutputTokens) {
        rafRef.current = requestAnimationFrame(tick);
      } else if (onComplete) {
        onComplete(totalCost, estimatedCurrent);
      }
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [startTime, estimatedOutputTokens, onComplete, totalCost]);

  const progress = estimatedOutputTokens > 0 ? (currentTokens / estimatedOutputTokens) * 100 : 0;
  const tokensPerSecond = elapsedMs > 0 ? Math.round((currentTokens / elapsedMs) * 1000) : 0;

  return (
    <div
      className={`fixed bottom-6 right-6 z-50 transition-all duration-500 ${
        visible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"
      }`}
    >
      <div className="bg-[#111111] text-white rounded-xl shadow-2xl p-4 w-[280px] border border-[#333333]">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <Zap className="h-4 w-4 text-[#FF6B00]" />
          <span className="text-[12px] font-bold uppercase tracking-wider text-[#888888]">
            Live Cost Stream
          </span>
        </div>

        {/* Cost display */}
        <div className="flex items-baseline gap-1 mb-1">
          <DollarSign className="h-5 w-5 text-[#FF6B00]" />
          <span className="text-[32px] font-extrabold tracking-tight tabular-nums">
            {totalCost.toFixed(4)}
          </span>
        </div>
        <p className="text-[11px] text-[#666666] mb-3">
          Est. total: ${estimatedTotalCost.toFixed(4)} · {model}
        </p>

        {/* Progress bar */}
        <div className="w-full bg-[#333333] rounded-full h-1.5 mb-3 overflow-hidden">
          <div
            className="bg-[#FF6B00] h-full rounded-full transition-all duration-100"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[14px] font-bold tabular-nums">{currentTokens.toLocaleString()}</p>
            <p className="text-[10px] text-[#666666]">Tokens</p>
          </div>
          <div>
            <p className="text-[14px] font-bold tabular-nums">{tokensPerSecond}/s</p>
            <p className="text-[10px] text-[#666666]">Speed</p>
          </div>
          <div>
            <p className="text-[14px] font-bold tabular-nums">{(elapsedMs / 1000).toFixed(1)}s</p>
            <p className="text-[10px] text-[#666666]">Elapsed</p>
          </div>
        </div>

        {/* Warning when expensive */}
        {estimatedTotalCost > 0.5 && (
          <div className="mt-3 bg-[#FF6B00]/10 border border-[#FF6B00]/30 rounded px-2 py-1.5">
            <p className="text-[11px] text-[#FF6B00] font-semibold">
              High-cost stream — ${estimatedTotalCost.toFixed(2)} estimated
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
