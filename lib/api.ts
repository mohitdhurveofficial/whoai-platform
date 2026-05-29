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