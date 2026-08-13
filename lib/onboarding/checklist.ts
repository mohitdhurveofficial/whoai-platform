import { prisma } from "@/lib/prisma";

/**
 * The four things a workspace must do before WHOAI shows it anything useful.
 *
 * Every step is *derived* from the database, never stored as a flag. A stored
 * "hasCompletedOnboarding" boolean drifts the moment someone deletes their last
 * provider key or their only agent — the checklist would keep claiming they
 * were set up while the gateway returned errors. Deriving costs one query and
 * is always true.
 */

export type OnboardingStepId = "provider" | "agent" | "request" | "budget";

export interface OnboardingStep {
  id: OnboardingStepId;
  title: string;
  /** What the customer gets out of doing it — not a restatement of the title. */
  description: string;
  href: string;
  cta: string;
  done: boolean;
}

export interface OnboardingState {
  steps: OnboardingStep[];
  completedCount: number;
  /** True once every step is done; the caller hides the checklist entirely. */
  complete: boolean;
  /** The first unfinished step, so the UI can lead with one clear action. */
  nextStep: OnboardingStep | null;
}

export async function getOnboardingState(organizationId: string): Promise<OnboardingState> {
  // One round trip. Counts rather than full rows: nothing here needs the data,
  // only whether any exists.
  const [providerCount, agentCount, requestCount, organization] = await Promise.all([
    prisma.providerCredential.count({ where: { organizationId } }),
    prisma.agent.count({ where: { organizationId } }),
    prisma.requestLog.count({ where: { organizationId } }),
    prisma.organization.findUnique({
      where: { id: organizationId },
      select: { dailyBudget: true, monthlyBudget: true },
    }),
  ]);

  // Budgets default to 0, which means "unset" rather than "zero allowance" —
  // the kill switch treats 0 as no limit. Either one configured counts.
  const hasBudget =
    Number(organization?.dailyBudget ?? 0) > 0 || Number(organization?.monthlyBudget ?? 0) > 0;

  const steps: OnboardingStep[] = [
    {
      id: "provider",
      title: "Connect a provider key",
      description:
        "WHOAI is strict BYOK — your OpenAI or Anthropic key, encrypted at rest. Until one exists, gateway calls fail closed.",
      href: "/settings/providers",
      cta: "Add a key",
      done: providerCount > 0,
    },
    {
      id: "agent",
      title: "Create your first agent",
      description:
        "An agent is the unit WHOAI meters, budgets, and can pause. Creating one issues the API key your code authenticates with.",
      href: "/agents",
      cta: "Create an agent",
      done: agentCount > 0,
    },
    {
      id: "request",
      title: "Send a request through the gateway",
      description:
        "Point your existing OpenAI or Anthropic client at the WHOAI base URL. The first call starts your cost telemetry.",
      href: "/docs/quickstart",
      cta: "View the quickstart",
      done: requestCount > 0,
    },
    {
      id: "budget",
      title: "Set a spend limit",
      description:
        "A daily or monthly cap turns observability into control: WHOAI pauses the agent instead of letting a runaway loop bill you.",
      href: "/settings",
      cta: "Set a budget",
      done: hasBudget,
    },
  ];

  const completedCount = steps.filter((step) => step.done).length;

  return {
    steps,
    completedCount,
    complete: completedCount === steps.length,
    nextStep: steps.find((step) => !step.done) ?? null,
  };
}
