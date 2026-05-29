import Link from "next/link";

export default function Sidebar() {

  return (

    <div className="w-64 bg-slate-900 text-white min-h-screen p-6">

      <h2 className="text-2xl font-bold mb-8">

        WhoAI

      </h2>

      <nav className="space-y-4">

        <Link href="/dashboard" className="block">

          Dashboard

        </Link>

        <Link href="/agents" className="block">

          Agents

        </Link>

        <Link href="/policies" className="block">

          Policies

        </Link>

        <Link href="/approvals" className="block">

          Approvals

        </Link>

        <Link href="/doctor" className="block">

          Doctor

        </Link>

      </nav>

    </div>

  );

}