import Link from "next/link";
import { ArrowRight, Check } from "lucide-react";
import type { OnboardingState } from "@/lib/onboarding/checklist";

/**
 * Setup checklist for a workspace that has not finished connecting.
 *
 * Renders nothing once every step is done — there is no dismiss control on
 * purpose. Each step is derived from live state, so the only way to make this
 * disappear is to actually finish setup, and a workspace that removes its last
 * provider key should be told again.
 */
export function OnboardingChecklist({ state }: { state: OnboardingState }) {
  if (state.complete) return null;

  const total = state.steps.length;
  const percent = Math.round((state.completedCount / total) * 100);

  return (
    <section
      aria-labelledby="onboarding-heading"
      className="rounded-2xl border border-[#EEE8E2] bg-white p-6 shadow-[0_1px_2px_rgba(17,17,17,0.05)]"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h2 id="onboarding-heading" className="text-[16px] font-bold text-[#111111]">
            Finish setting up WHOAI
          </h2>
          <p className="mt-1 text-[13px] text-[#666666]">
            {state.nextStep
              ? `Next: ${state.nextStep.title.toLowerCase()}.`
              : "You're nearly there."}{" "}
            Four steps to full cost visibility and control.
          </p>
        </div>

        <div className="shrink-0 sm:text-right">
          <p className="text-[13px] font-semibold text-[#111111]">
            {state.completedCount} of {total} complete
          </p>
          <div
            className="mt-2 h-1.5 w-full min-w-[140px] overflow-hidden rounded-full bg-[#F3EEE8]"
            role="progressbar"
            aria-valuenow={state.completedCount}
            aria-valuemin={0}
            aria-valuemax={total}
            aria-label="Setup progress"
          >
            <div
              className="h-full rounded-full bg-[#FF6B00] transition-[width] duration-500"
              style={{ width: `${percent}%` }}
            />
          </div>
        </div>
      </div>

      <ol className="mt-5 space-y-2">
        {state.steps.map((step, index) => {
          const isNext = state.nextStep?.id === step.id;

          return (
            <li
              key={step.id}
              className={`flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between ${
                isNext
                  ? "border-[#FFD9C2] bg-[#FFF8F4]"
                  : "border-[#F0EBE5] bg-white"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[12px] font-bold ${
                    step.done
                      ? "bg-[#16A34A] text-white"
                      : isNext
                        ? "bg-[#FF6B00] text-white"
                        : "border border-[#DCD5CD] bg-white text-[#888888]"
                  }`}
                >
                  {step.done ? <Check className="h-3.5 w-3.5" /> : index + 1}
                </span>

                <div>
                  <p
                    className={`text-[14px] font-semibold ${
                      step.done ? "text-[#888888] line-through" : "text-[#111111]"
                    }`}
                  >
                    {step.title}
                    {/* The strikethrough is decorative; screen readers get words. */}
                    <span className="sr-only">{step.done ? " — done" : " — not done"}</span>
                  </p>
                  {!step.done && (
                    <p className="mt-1 max-w-prose text-[13px] leading-relaxed text-[#666666]">
                      {step.description}
                    </p>
                  )}
                </div>
              </div>

              {!step.done && (
                <Link
                  href={step.href}
                  className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md px-4 py-2 text-[13px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FF6B00] focus-visible:ring-offset-2 ${
                    isNext
                      ? "bg-[#FF6B00] text-white hover:bg-[#E65A00]"
                      : "border border-[#EEE8E2] text-[#111111] hover:border-[#DCD5CD]"
                  }`}
                >
                  {step.cta}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
}
