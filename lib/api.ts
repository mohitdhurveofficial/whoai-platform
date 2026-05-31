import { dashboardMetrics, auditLogs } from "./mockData";

export async function getDashboardMetrics() {
  return dashboardMetrics;
}

export async function getAuditLogs() {
  return auditLogs;
}