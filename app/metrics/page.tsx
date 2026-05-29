import { getMetrics } from "@/lib/api";

export default async function MetricsPage() {
  const metrics = await getMetrics().catch(() => ({
    error: "Unable to load metrics",
  }));

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        Platform Metrics
      </h1>

      <div className="rounded-lg border p-4">
        <pre className="overflow-auto text-sm">
          {JSON.stringify(metrics, null, 2)}
        </pre>
      </div>
    </main>
  );
}