import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export interface RecordSpendParams {
  organizationId: string;
  agentId: string;
  model: string;
  provider: string;
  tokensIn: number;
  tokensOut: number;
  cost: number;
  metadata?: Prisma.InputJsonValue;
}

export class SpendEngine {
  static async recordSpend(params: RecordSpendParams) {
    const { organizationId, agentId, model, provider, tokensIn, tokensOut, cost, metadata } = params;

    const spendLog = await prisma.spendLog.create({
      data: {
        organizationId,
        agentId,
        model,
        provider,
        tokensIn,
        tokensOut,
        cost,
        metadata: metadata || {},
      },
    });

    return spendLog;
  }
}
