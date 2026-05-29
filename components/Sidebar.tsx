export default function Sidebar() {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-6">
      <h1 className="text-2xl font-bold mb-8">
        WhoAI
      </h1>

      <nav className="space-y-4">
        <a
          href="/dashboard"
          className="block hover:text-blue-400"
        >
          Dashboard
        </a>

        <a
          href="/agents"
          className="block hover:text-blue-400"
        >
          Agents
        </a>

        <a
          href="/policies"
          className="block hover:text-blue-400"
        >
          Policies
        </a>

        <a
          href="/approvals"
          className="block hover:text-blue-400"
        >
          Approvals
        </a>

        <a
          href="/doctor"
          className="block hover:text-blue-400"
        >
          Doctor
        </a>
      </nav>
    </aside>
  );
}