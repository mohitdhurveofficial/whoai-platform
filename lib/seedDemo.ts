import { prisma } from "@/lib/prisma";

type SeedOptions = {
  organizationId: string;
};

export async function seedDemoWorkspace({ organizationId }: SeedOptions) {
  try {
    // Seed AI Workers
    const workers = await prisma.agent.createMany({
      data: [
        {
          id: "worker-default-1",
          organizationId,
          name: "Payments Agent",
          environment: "PRODUCTION",
          agentToken: "seed-token-1",
          status: "ACTIVE",
        },
        {
          id: "worker-default-2",
          organizationId,
          name: "Data Privacy Agent",
          environment: "PRODUCTION",
          agentToken: "seed-token-2",
          status: "ACTIVE",
        },
        {
          id: "worker-default-3",
          organizationId,
          name: "Support Bot",
          environment: "PRODUCTION",
          agentToken: "seed-token-3",
          status: "ACTIVE",
        },
        {
          id: "worker-default-4",
          organizationId,
          name: "Analytics Engine",
          environment: "STAGING",
          agentToken: "seed-token-4",
          status: "ACTIVE",
        },
      ],
      skipDuplicates: true,
    });

    // Seed Policies
    const policies = await prisma.policy.createMany({
      data: [
        {
          id: "policy-1",
          organizationId,
          action: "Provide Discount",
          resource: "Pricing API",
          condition: "Discount > 25%",
          effect: "REQUIRE_APPROVAL",
          riskLevel: "HIGH",
        },
        {
          id: "policy-2",
          organizationId,
          action: "Delete Data",
          resource: "Customer Database",
          condition: "Is GDPR Request",
          effect: "BLOCK",
          riskLevel: "CRITICAL",
        },
        {
          id: "policy-3",
          organizationId,
          action: "Modify DB",
          resource: "Production DB",
          condition: "Any",
          effect: "REQUIRE_APPROVAL",
          riskLevel: "HIGH",
        },
      ],
      skipDuplicates: true,
    });

    // Seed Decisions
    const decisions = await prisma.decision.createMany({
      data: [
        {
          id: "decision-1",
          organizationId,
          agentId: "worker-default-1",
          policyId: "policy-1",
          actionType: "Provide Discount",
          resourceJson: "{\"discount\": 30}",
          contextJson: "{\"customer\": \"Acme Corp\"}",
          decision: "NEEDS_APPROVAL",
          reason: "Discount exceeds 25%",
        },
        {
          id: "decision-2",
          organizationId,
          agentId: "worker-default-2",
          policyId: "policy-2",
          actionType: "Delete Data",
          resourceJson: "{\"userId\": 123}",
          contextJson: "{\"region\": \"EU\"}",
          decision: "ALLOW",
          reason: "GDPR deletion request processed",
        },
      ],
      skipDuplicates: true,
    });

    // Seed Approvals
    const approvals = await prisma.approval.createMany({
      data: [
        {
          organizationId,
          decisionId: "decision-1",
          status: "PENDING",
        },
        {
          organizationId,
          decisionId: "decision-2",
          status: "APPROVED",
        },
      ],
      skipDuplicates: true,
    });

    return {
      workers: workers.count,
      policies: policies.count,
      decisions: decisions.count,
      approvals: approvals.count,
    };
  } catch (error) {
    console.error("Error seeding demo workspace:", error);
    throw error;
  }
}
