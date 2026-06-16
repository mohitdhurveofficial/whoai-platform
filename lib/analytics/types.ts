export type DashboardSummary = {
  totalSpend: number;
  todaySpend: number;
  activeAgents: number;
  blockedRequests: number;
  providerCount: number;
};

export type SpendByDayPoint = {
  date: string;
  spend: number;
};

export type SpendByAgentPoint = {
  agentId: string;
  agentName: string;
  spend: number;
};

export type SpendByModelPoint = {
  model: string;
  spend: number;
};

export type UsageSummary = {
  totalRequests: number;
  totalTokens: number;
  totalSpend: number;
  averageCost: number;
  averageLatency: number;
};

export type UsageRequestRow = {
  id: string;
  timestamp: string;
  agentId: string;
  agentName: string;
  provider: string;
  model: string;
  statusCode: number;
  latencyMs: number;
  tokens: number;
  spend: number;
};

export type AgentAnalytics = {
  agent: {
    id: string;
    name: string;
    status: string;
    model: string | null;
    createdAt: string;
    dailyBudget: number;
    monthlyBudget: number;
    currentSpend: number;
    remainingBudget: number;
  };
  spendByDay: SpendByDayPoint[];
  requestsByDay: Array<{ date: string; requests: number }>;
  blockedRequests: number;
  averageCostPerRequest: number;
  averageTokensPerRequest: number;
  recentActivity: Array<{
    id: string;
    action: string;
    status: string | null;
    timestamp: string;
    metadata: unknown;
  }>;
};

export type AgentAnalyticsRow = {
  id: string;
  name: string;
  status: string;
  model: string | null;
  todaySpend: number;
  monthlySpend: number;
  dailyBudget: number;
  monthlyBudget: number;
  requests: number;
  blockedRequests: number;
  lastActivity: string | null;
  createdAt: string;
};

export type UsageFilters = {
  from?: Date;
  to?: Date;
  agentId?: string;
  model?: string;
  provider?: string;
};

export type UsageTimelinePoint = {
  date: string;
  requests: number;
  spend: number;
};
