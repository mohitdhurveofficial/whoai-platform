import { prisma } from "@/lib/prisma";

type SeedOptions = {
  organizationId: string;
};

export async function seedAuditDeliverable({ organizationId }: SeedOptions) {
  try {
    // DAY 3/4 MANUAL ENTRY: Inject the Shadow AI Agents you discovered here
    const workers = await prisma.agent.createMany({
      data: [
        {
          id: "worker-default-1",
          organizationId,
          name: "Salesforce Sync Script (Discovered)",
          environment: "PRODUCTION",
          agentToken: "seed-token-1",
          status: "ACTIVE",
        },
        {
          id: "worker-default-2",
          organizationId,
          name: "Rogue Support Copilot (Unmanaged)",
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

    // Seed 500 Demo Spend Logs to populate the FinOps Dashboard
    const spendLogsData = [];
    const models = ["gpt-4o", "gpt-4o-mini", "claude-3-5-sonnet-20240620", "claude-3-haiku-20240307"];
    const agentIds = ["worker-default-1", "worker-default-2", "worker-default-3", "worker-default-4"];
    
    for (let i = 0; i < 500; i++) {
      const agentId = agentIds[Math.floor(Math.random() * agentIds.length)];
      const model = models[Math.floor(Math.random() * models.length)];
      const promptTokens = Math.floor(Math.random() * 1500) + 100;
      const completionTokens = Math.floor(Math.random() * 800) + 50;
      
      // Vary dates over the last 14 days
      const pastDate = new Date();
      pastDate.setHours(pastDate.getHours() - Math.floor(Math.random() * 14 * 24));

      // Generate realistic varying costs
      const costUsd = (promptTokens * 0.005 / 1000) + (completionTokens * 0.015 / 1000) + (Math.random() * 0.05);

      spendLogsData.push({
        organizationId,
        agentId,
        model,
        tokensUsed: promptTokens + completionTokens,
        costUsd,
        action: "LLM_COMPLETION",
        createdAt: pastDate,
      });
    }

    const spendLogs = await prisma.spendLog.createMany({
      data: spendLogsData,
      skipDuplicates: true,
    });

    return {
      workers: workers.count,
      policies: policies.count,
      decisions: decisions.count,
      approvals: approvals.count,
      spendLogs: spendLogs.count,
    };
  } catch (error) {
    console.error("Error seeding demo workspace:", error);
    throw error;
  }
}
