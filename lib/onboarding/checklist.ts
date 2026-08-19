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
  // Genuinely one round trip. Promise.all does not buy parallelism here:
  // production connects through PgBouncer with connection_limit=1, so four
  // "concurrent" queries are four serial ones plus pool contention.
  //
  // EXISTS rather than COUNT throughout — the checklist only asks whether any
  // row exists, and counting every RequestLog row of a busy workspace to learn
  // "at least one" is the difference between an index probe and a full scan.
  // Budgets default to 0, which means "unset" rather than "zero allowance":
  // the kill switch treats 0 as no limit, so the checklist must agree.
  const [row] = await prisma.$queryRaw<
    Array<{ has_provider: boolean; has_agent: boolean; has_request: boolean; has_budget: boolean }>
  >`
    SELECT
      EXISTS (SELECT 1 FROM "ProviderCredential" WHERE "organizationId" = ${organizationId}) AS has_provider,
      EXISTS (SELECT 1 FROM "Agent" WHERE "organizationId" = ${organizationId}) AS has_agent,
      EXISTS (SELECT 1 FROM "RequestLog" WHERE "organizationId" = ${organizationId}) AS has_request,
      COALESCE(
        (SELECT "dailyBudget" > 0 OR "monthlyBudget" > 0 FROM "Organization" WHERE id = ${organizationId}),
        false
      ) AS has_budget
  `;

  const hasBudget = row?.has_budget === true;

  const steps: OnboardingStep[] = [
    {
      id: "provider",
      title: "Connect a provider key",
      description:
        "WHOAI is strict BYOK — your OpenAI or Anthropic key, encrypted at rest. Until one exists, gateway calls fail closed.",
      href: "/settings/providers",
      cta: "Add a key",
      done: row?.has_provider === true,
    },
    {
      id: "agent",
      title: "Create your first agent",
      description:
        "An agent is the unit WHOAI meters, budgets, and can pause. Creating one issues the API key your code authenticates with.",
      href: "/agents",
      cta: "Create an agent",
      done: row?.has_agent === true,
    },
    {
      id: "request",
      title: "Send a request through the gateway",
      description:
        "Point your existing OpenAI or Anthropic client at the WHOAI base URL. The first call starts your cost telemetry.",
      href: "/docs/quickstart",
      cta: "View the quickstart",
      done: row?.has_request === true,
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
