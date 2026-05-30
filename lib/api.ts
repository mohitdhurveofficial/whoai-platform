import {
  activityFeed,
  agents,
  approvals,
  auditLogs,
  dashboardMetrics,
  decisions,
  policies,
  recentDecisions,
} from "./mockData";

export async function getAgents() {
  return agents;
}

export async function getApprovals() {
  return approvals;
}

export async function getDecisions() {
  return decisions;
}

export async function getPolicies() {
  return policies;
}

export async function getAuditLogs() {
  return auditLogs;
}

export async function getActivityFeed() {
  return activityFeed;
}

export async function getDashboardMetrics() {
  return {
    overview: dashboardMetrics.overview,
    trend: dashboardMetrics.trend,
    riskDistribution: dashboardMetrics.riskDistribution,
    recentDecisions,
    approvalQueue: approvals,
    activityFeed,
  };
}

export async function getDoctor() {
  return {
    score: 100,
    status: "Healthy",
  };
}