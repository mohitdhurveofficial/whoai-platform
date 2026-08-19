import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import MarketingShell from "@/components/marketing/MarketingShell";
import { GATEWAY_COMPLETIONS_URL, GATEWAY_TOKEN_URL } from "@/lib/runtime-url";
import { Reveal, Stagger, StaggerItem, MagneticButton } from "@/components/marketing/Motion";

export const metadata: Metadata = {
  title: "Quickstart Guide",
  description:
    "Get started with WHOAI in 5 minutes: add a provider key, create an agent, and route your first request through the gateway.",
  alternates: { canonical: "/docs/quickstart" },
};

const sdkExample = `pip install whoai

export WHOAI_API_KEY="whoai_sk_..."`;

const sdkCode = `from whoai import WhoAI

client = WhoAI()  # reads WHOAI_API_KEY

response = client.chat_completion(
    model="gpt-4o",
    messages=[{"role": "user", "content": "Summarize Q3 revenue."}],
)
print(response["choices"][0]["message"]["content"])`;

const dropInCode = `# Already using the OpenAI SDK? Change one line.
- from openai import OpenAI
- client = OpenAI(api_key=os.environ["OPENAI_API_KEY"])
+ from whoai import openai_client
+ client = openai_client()

  response = client.chat.completions.create(
      model="gpt-4o",
      messages=[{"role": "user", "content": "Hello"}],
  )`;

const curlExample = `# 1. Exchange your agent key for a gateway token (valid 1 hour).
TOKEN=$(curl -s ${GATEWAY_TOKEN_URL} \\
  -H "Content-Type: application/json" \\
  -d "{\\"api_key\\": \\"$WHOAI_API_KEY\\"}" | jq -r .access_token)

# 2. Send the request. WHOAI injects your provider key server-side.
curl ${GATEWAY_COMPLETIONS_URL} \\
  -H "Authorization: Bearer $TOKEN" \\
  -H "Content-Type: application/json" \\
  -d '{
    "provider": "openai",
    "model": "gpt-4o",
    "messages": [
      { "role": "user", "content": "Summarize Q3 revenue." }
    ]
  }'`;

function CodeBlock({ children }: { children: string }) {
  return (
    <pre className="mt-4 rounded-xl border border-[#26211C] bg-[#1A1714] p-5 font-mono text-[13px] leading-relaxed text-[#E8E2DA] overflow-x-auto">
      <code>{children}</code>
    </pre>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <StaggerItem className="flex items-start gap-6">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#FFF1E8] text-[#FF6B00]">
        <span className="text-[24px] font-bold" aria-hidden="true">
          {number}
        </span>
      </div>
      <div className="min-w-0 flex-1">
        <h2 className="mb-2 text-[20px] font-bold text-[#111111]">
          <span className="sr-only">Step {number}: </span>
          {title}
        </h2>
        <div className="text-[15px] leading-relaxed text-[#666666]">{children}</div>
      </div>
    </StaggerItem>
  );
}

export default function QuickstartPage() {
  return (
    <MarketingShell>
      <div className="mx-auto max-w-[900px] px-6 py-20">
        <Reveal className="mx-auto mb-16 max-w-[720px] text-center">
          <span className="mb-4 inline-block text-[12px] font-semibold uppercase tracking-widest text-[#FF6B00]">
            Documentation
          </span>
          <h1 className="mb-6 text-[40px] font-extrabold leading-[1.1] tracking-tight md:text-[52px]">
            Get started in 5 minutes
          </h1>
          <p className="text-[18px] leading-relaxed text-[#666666]">
            Add a provider key, create an agent, and route your first request. Your spend shows up on
            the dashboard the moment the call completes.
          </p>
        </Reveal>

        <Stagger className="space-y-12 pb-8" stagger={0.1}>
          <Step number={1} title="Create your account">
            <p>
              Sign up at{" "}
              <Link href="/auth/signup" className="font-medium text-[#FF6B00] hover:underline">
                whoai.ai/auth/signup
              </Link>
              . Your workspace is created with your account — there is nothing else to set up, and
              the Free plan needs no card.
            </p>
          </Step>

          <Step number={2} title="Add a provider key">
            <p>
              Go to <strong className="font-semibold text-[#111111]">Settings → Providers</strong>{" "}
              and paste your OpenAI or Anthropic key. WHOAI is strict BYOK: the key is encrypted at
              rest, injected server-side at call time, and never returned by any API or written to a
              log. You keep your provider billing relationship; we never resell tokens.
            </p>
          </Step>

          <Step number={3} title="Create an agent">
            <p>
              On the <strong className="font-semibold text-[#111111]">Agents</strong> page, create an
              agent for each workload you want costed separately — one per service, job, or customer.
              You get a key that looks like{" "}
              <code className="rounded bg-[#FAF7F3] px-1 py-0.5 font-mono text-[13px]">
                whoai_sk_…
              </code>
              , shown once. It spends nothing on its own and can be revoked at any time.
            </p>
          </Step>

          <Step number={4} title="Send your first request">
            <p>The Python SDK handles the token exchange and refresh for you:</p>
            <CodeBlock>{sdkExample}</CodeBlock>
            <CodeBlock>{sdkCode}</CodeBlock>
            <p className="mt-6">
              The response is the provider&apos;s own JSON, unchanged — so if you already call the
              OpenAI SDK, the drop-in client keeps every call site as it is:
            </p>
            <CodeBlock>{dropInCode}</CodeBlock>
            <p className="mt-6">
              Any language works over plain HTTP. Exchange the agent key for a token, then call the
              OpenAI-compatible endpoint:
            </p>
            <CodeBlock>{curlExample}</CodeBlock>
          </Step>

          <Step number={5} title="Set a budget">
            <p>
              In <strong className="font-semibold text-[#111111]">Settings</strong>, set a monthly
              spend cap for the workspace, and per-agent daily limits on each agent. These are
              enforced at the gateway: once a limit is hit, requests are refused rather than billed,
              and you get an alert. That is the difference between a dashboard and a control plane.
            </p>
          </Step>

          <Step number={6} title="Watch spend in real time">
            <p>
              The{" "}
              <Link href="/dashboard" className="font-medium text-[#FF6B00] hover:underline">
                dashboard
              </Link>{" "}
              shows cost, tokens, model, and latency for every call, attributed to the agent that
              made it — so a runaway retry loop is visible in minutes, not on next month&apos;s
              invoice.
            </p>
          </Step>
        </Stagger>

        <Reveal className="mt-16 rounded-xl border border-[#EEE8E2] bg-[#FAF7F3] p-6">
          <h2 className="mb-4 text-[20px] font-bold text-[#111111]">Need help?</h2>
          <p className="mb-4 text-[15px] text-[#666666]">
            Read the{" "}
            <Link href="/docs" className="font-medium text-[#FF6B00] hover:underline">
              full documentation
            </Link>{" "}
            or book a{" "}
            <Link href="/demo" className="font-medium text-[#FF6B00] hover:underline">
              live demo
            </Link>
            .
          </p>
          <MagneticButton
            href="/contact"
            className="inline-flex items-center gap-2 rounded-md border border-[#FF6B00] px-5 py-3 text-[15px] font-semibold text-[#FF6B00] transition-colors hover:bg-[#FFF1E8]"
          >
            Contact support <ArrowRight className="h-4 w-4" />
          </MagneticButton>
        </Reveal>
      </div>
    </MarketingShell>
  );
}
