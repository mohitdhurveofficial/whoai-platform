import Link from "next/link";
import { KeyRound } from "lucide-react";

// Shown on the dashboard while an organization has not configured any provider
// credentials. WHOAI is strict BYOK: until a key is added, gateway requests
// fail closed with a clear error, so we prompt the customer to finish setup.
// Renders nothing once at least one provider key exists.
export function ProviderSetupBanner({ configuredCount }: { configuredCount: number }) {
  if (configuredCount > 0) return null;

  return (
    <div className="flex flex-col gap-3 rounded-lg border border-amber-300 bg-amber-50 p-5 shadow-sm md:flex-row md:items-center md:justify-between">
      <div className="flex items-start gap-3">
        <KeyRound className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
        <div>
          <p className="text-[14px] font-semibold text-amber-900">
            Action required: connect your AI provider keys
          </p>
          <p className="mt-1 text-[13px] text-amber-800">
            WHOAI runs on your own API keys (BYOK). Add an OpenAI or Anthropic key to
            start routing agent requests — until then, gateway calls are blocked with a
            setup error and no model costs are incurred.
          </p>
        </div>
      </div>
      <Link
        href="/settings/providers"
        className="inline-flex shrink-0 items-center justify-center rounded-md border border-amber-600 bg-amber-600 px-4 py-2 text-[13px] font-semibold text-white shadow-sm hover:bg-amber-700"
      >
        Add provider keys
      </Link>
    </div>
  );
}
