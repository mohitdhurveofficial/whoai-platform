const API_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  "https://whoai-api.onrender.com";

async function fetchJson(path: string) {
  const response = await fetch(`${API_URL}${path}`, {
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json();
}

export async function getOverview() {
  return fetchJson("/api/v1/dashboard/overview");
}

export async function getDoctor() {
  return fetchJson("/api/v1/doctor/report");
}

export async function getAgents() {
  return fetchJson("/api/v1/agents");
}

export async function getPolicies() {
  return fetchJson("/api/v1/policies");
}

export async function getApprovals() {
  return fetchJson("/api/v1/approvals");
}

export async function getDecisions() {
  return fetchJson("/api/v1/decisions");
}

export async function getMetrics() {
  return fetchJson("/api/v1/metrics");
}

export async function getLogs() {
  return fetchJson("/api/v1/logs");
}

export async function getRecentActivity() {
  return fetchJson("/api/v1/dashboard/recent-activity");
}

export async function getSystemHealth() {
  return fetchJson("/api/v1/system/health");
}

export async function getSystemReadiness() {
  return fetchJson("/api/v1/system/readiness");
}

export async function getSystemDiagnostics() {
  return fetchJson("/api/v1/system/diagnostics");
}

export async function getDecisionAnalytics() {
  return fetchJson("/api/v1/analytics/decisions");
}

export async function getRiskAnalytics() {
  return fetchJson("/api/v1/analytics/risk");
}
export async function updateApproval(
  approvalId: number,
  status: string
) {
  const response = await fetch(
    `${API_URL}/api/v1/approvals/${approvalId}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        status,
        approved_by: "mohit",
      }),
    }
  );

  return response.json();
}