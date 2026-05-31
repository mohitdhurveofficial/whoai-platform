import { prisma } from "@/lib/prisma";
import DecisionsClient from "./DecisionsClient";

export default async function DecisionsPage() {
  const decisions = await prisma.decision.findMany({
    include: { aiWorker: true },
    orderBy: { createdAt: 'desc' }
  });

  const formatted = decisions.map(d => ({
    id: d.id,
    timestamp: d.createdAt.toISOString(),
    agentId: d.aiWorkerId,
    agentName: d.aiWorker?.name || 'Unknown',
    action: d.title,
    description: d.description || '',
    riskScore: d.riskScore,
    riskLevel: d.riskLevel,
    confidenceScore: d.confidenceScore,
    status: d.status,
    policyImpact: d.policiesApplied || []
  }));

  return <DecisionsClient initialData={formatted} />;
}