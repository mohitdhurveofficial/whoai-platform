const API_URL = "https://whoai-api.onrender.com";

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

export async function getDecisions() {
  return fetchJson("/api/v1/decisions");
}