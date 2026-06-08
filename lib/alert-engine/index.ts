import { Prisma } from '@prisma/client';
import { prisma } from '../prisma';

export enum AlertType {
  DAILY_LIMIT_REACHED = 'DAILY_LIMIT_REACHED',
  MONTHLY_LIMIT_REACHED = 'MONTHLY_LIMIT_REACHED',
  AGENT_LIMIT_REACHED = 'AGENT_LIMIT_REACHED',
  ORG_LIMIT_REACHED = 'ORG_LIMIT_REACHED',
  SPEND_SPIKE = 'SPEND_SPIKE',
  TOKEN_SPIKE = 'TOKEN_SPIKE',
  RUNAWAY_AGENT = 'RUNAWAY_AGENT',
}

export enum AlertSeverity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface CreateAlertParams {
  organizationId: string;
  agentId?: string;
  type: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  metadata?: Prisma.InputJsonValue;
}

export class AlertEngine {
  static async createAlert(params: CreateAlertParams) {
    const { organizationId, agentId, type, severity, title, message, metadata } = params;

    const alert = await prisma.alert.create({
      data: {
        organizationId,
        agentId,
        type,
        severity,
        title,
        message,
        metadata: metadata || {},
        resolved: false,
        createdAt: new Date(),
      },
    });

    return alert;
  }
}
