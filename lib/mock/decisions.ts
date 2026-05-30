import { decisions as _decisions } from "@/lib/mockData";
import { MOCK_AGENTS } from "@/lib/mock/agents";

export const MOCK_DECISIONS = _decisions.map((decision) => {
  const agent = MOCK_AGENTS.find((agent) => agent.name === decision.agent);

  return {
    ...decision,
    agentId: agent?.id ?? "agent-1",
    description: `${decision.action} for ${decision.agent}`,
    confidenceScore: Math.max(45, Math.min(99, Math.round(100 - decision.riskScore * 0.7))),
    approvalStatus: decision.status,
    policyImpact: [decision.policy],
  };
});
