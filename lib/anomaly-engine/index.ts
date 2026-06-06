import { prisma } from '../prisma';
import { AlertEngine, AlertType, AlertSeverity } from '../alert-engine';

export class AnomalyEngine {
  static async checkAnomalies(agentId: string, currentCost: number, currentTokens: number) {
    const agent = await prisma.agent.findUnique({
      where: { id: agentId },
      include: { organization: true },
    });

    if (!agent) return;

    // Check Runaway Agent (e.g., > 100 requests in last 5 minutes)
    const fiveMinsAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentRequests = await prisma.requestLog.count({
      where: {
        agentId,
        timestamp: { gte: fiveMinsAgo },
      },
    });

    if (recentRequests > 100) {
      await AlertEngine.createAlert({
        organizationId: agent.organizationId,
        agentId: agent.id,
        type: AlertType.RUNAWAY_AGENT,
        severity: AlertSeverity.CRITICAL,
        title: 'Runaway Agent Detected',
        message: `Agent ${agent.name} is making too many requests (${recentRequests} in 5 mins).`,
        metadata: { recentRequests, agentId },
      });

      // Auto-pause agent
      await prisma.agent.update({
        where: { id: agentId },
        data: {
          status: 'PAUSED',
          pauseReason: 'Auto-paused due to RUNAWAY_AGENT detection',
          pausedAt: new Date(),
          pausedBy: 'SYSTEM',
        },
      });
    }

    // Spend Spike & Token Spike (simple hourly comparison for MVP)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000);

    const prevHourSpendLogs = await prisma.spendLog.aggregate({
      where: { agentId, createdAt: { gte: twoHoursAgo, lt: oneHourAgo } },
      _sum: { cost: true, tokensIn: true, tokensOut: true },
    });

    const currentHourSpendLogs = await prisma.spendLog.aggregate({
      where: { agentId, createdAt: { gte: oneHourAgo } },
      _sum: { cost: true, tokensIn: true, tokensOut: true },
    });

    const prevHourCost = Number(prevHourSpendLogs._sum.cost || 0);
    const currentHourCost = Number(currentHourSpendLogs._sum.cost || 0) + currentCost;

    if (prevHourCost > 1 && currentHourCost > prevHourCost * 5) {
      await AlertEngine.createAlert({
        organizationId: agent.organizationId,
        agentId: agent.id,
        type: AlertType.SPEND_SPIKE,
        severity: AlertSeverity.HIGH,
        title: 'Spend Spike Detected',
        message: `Agent ${agent.name} spend spiked to $${currentHourCost.toFixed(2)} in the last hour.`,
        metadata: { prevHourCost, currentHourCost },
      });
    }

    const prevHourTokens = Number(prevHourSpendLogs._sum.tokensIn || 0) + Number(prevHourSpendLogs._sum.tokensOut || 0);
    const currentHourTokens = Number(currentHourSpendLogs._sum.tokensIn || 0) + Number(currentHourSpendLogs._sum.tokensOut || 0) + currentTokens;

    if (prevHourTokens > 10000 && currentHourTokens > prevHourTokens * 5) {
      await AlertEngine.createAlert({
        organizationId: agent.organizationId,
        agentId: agent.id,
        type: AlertType.TOKEN_SPIKE,
        severity: AlertSeverity.HIGH,
        title: 'Token Spike Detected',
        message: `Agent ${agent.name} token usage spiked to ${currentHourTokens} in the last hour.`,
        metadata: { prevHourTokens, currentHourTokens },
      });
    }
  }
}
