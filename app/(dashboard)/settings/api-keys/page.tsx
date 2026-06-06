import { KeyRound, Plus } from "lucide-react";

export default function ApiKeysPage() {
  return (
    <div className="mx-auto max-w-6xl p-6 md:p-10">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">API Keys</h1>
          <p className="mt-2 text-gray-500">
            Manage API keys for accessing WHOAI.
          </p>
        </div>

        <button className="flex items-center gap-2 rounded-lg bg-[#FF6B00] px-4 py-2 font-medium text-white">
          <Plus className="h-4 w-4" />
          Create API Key
        </button>
      </div>

      <div className="rounded-xl border bg-white">
        <div className="flex items-center gap-3 border-b p-4">
          <KeyRound className="h-5 w-5" />
          <h2 className="font-semibold">Your API Keys</h2>
        </div>

        <div className="p-10 text-center text-gray-500">
          No API keys created yet.
        </div>
      </div>
    </div>
  );
}