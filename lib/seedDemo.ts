import { prisma } from "@/lib/prisma";

type SeedOptions = {
  workspaceId: string;
};

export async function seedDemoWorkspace({ workspaceId }: SeedOptions) {
  try {
    // Seed AI Workers
    const workers = await prisma.aIWorker.createMany({
      data: [
        {
          id: "worker-default-1",
          workspaceId,
          name: "Payments Agent",
          role: "Financial Operations",
          department: "Finance",
          owner: "Finance Team",
          description: "Processes and authorizes financial transactions",
          status: "ACTIVE",
          riskScore: 45,
          riskLevel: "MEDIUM",
          confidenceScore: 87,
        },
        {
          id: "worker-default-2",
          workspaceId,
          name: "Data Privacy Agent",
          role: "Compliance & Privacy",
          department: "Legal",
          owner: "Legal Team",
          description: "Manages GDPR compliance and data deletion requests",
          status: "ACTIVE",
          riskScore: 22,
          riskLevel: "LOW",
          confidenceScore: 92,
        },
        {
          id: "worker-default-3",
          workspaceId,
          name: "Support Bot",
          role: "Customer Support",
          department: "Support",
          owner: "Support Team",
          description: "Handles customer inquiries and resolves tickets",
          status: "ACTIVE",
          riskScore: 18,
          riskLevel: "LOW",
          confidenceScore: 78,
        },
        {
          id: "worker-default-4",
          workspaceId,
          name: "Analytics Engine",
          role: "Business Intelligence",
          department: "Analytics",
          owner: "Analytics Team",
          description: "Generates insights from business data",
          status: "ACTIVE",
          riskScore: 15,
          riskLevel: "LOW",
          confidenceScore: 85,
        },
      ],
      skipDuplicates: true,
    });

    // Seed Policies
    const policies = await prisma.policy.createMany({
      data: [
        {
          workspaceId,
          name: "Enterprise Discount Guardrail",
          description: "Restrict pricing discounts above 25% without approval",
          category: "Finance",
          status: "ACTIVE",
          enforcementMode: "REQUIRE_APPROVAL",
          version: 1,
          assignedAgentCount: 1,
        },
        {
          workspaceId,
          name: "GDPR Data Deletion Control",
          description: "Require audit trail for customer data deletions",
          category: "Compliance",
          status: "ACTIVE",
          enforcementMode: "BLOCK",
          version: 1,
          assignedAgentCount: 1,
        },
        {
          workspaceId,
          name: "Production Access Control",
          description: "Multi-factor approval for production modifications",
          category: "Security",
          status: "DRAFT",
          enforcementMode: "REQUIRE_APPROVAL",
          version: 1,
          assignedAgentCount: 0,
        },
      ],
      skipDuplicates: true,
    });

    // Seed Decisions
    const decisions = await prisma.decision.createMany({
      data: [
        {
          id: "decision-1",
          workspaceId,
          aiWorkerId: "worker-default-1",
          title: "Pricing Override Approved",
          description: "Customer requested 30% discount for annual contract",
          riskScore: 75,
          riskLevel: "HIGH",
          confidenceScore: 82,
          status: "APPROVED",
          policiesApplied: ["Enterprise Discount Guardrail"],
        },
        {
          id: "decision-2",
          workspaceId,
          aiWorkerId: "worker-default-2",
          title: "Customer Data Deletion",
          description: "GDPR deletion request processed for customer account",
          riskScore: 30,
          riskLevel: "MEDIUM",
          confidenceScore: 95,
          status: "APPROVED",
          policiesApplied: ["GDPR Data Deletion Control"],
        },
      ],
      skipDuplicates: true,
    });

    // Seed Approvals
    const approvals = await prisma.approval.createMany({
      data: [
        {
          workspaceId,
          decisionId: "decision-1",
          reviewerId: "reviewer-1",
          status: "PENDING",
          comment: "Awaiting high-value discount approval",
        },
        {
          workspaceId,
          decisionId: "decision-2",
          reviewerId: "reviewer-2",
          status: "PENDING",
          comment: "GDPR deletion audit verification",
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
