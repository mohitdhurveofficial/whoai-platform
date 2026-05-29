import { getLogs } from "@/lib/api";

export default async function LogsPage() {
  const logs = await getLogs().catch(() => []);

  return (
    <main className="p-8">
      <h1 className="text-3xl font-bold mb-6">Runtime Logs</h1>

      <div className="rounded-lg border p-4">
        <pre className="overflow-auto text-sm">
          {JSON.stringify(logs, null, 2)}
        </pre>
      </div>
    </main>
  );
}