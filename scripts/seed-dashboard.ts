/**
 * Seed demo data for the WHOAI dashboard.
 *
 * Run with:
 *   npx tsx scripts/seed-dashboard.ts
 *
 * Creates a demo org, user, 3 agents, ~500 spend logs, request logs,
 * and alerts so the dashboard looks alive on first signup.
 */

import "dotenv/config";
import { PrismaClient, OrgTier, AgentStatus } from "@prisma/client";
import crypto from "crypto";

const prisma = new PrismaClient();

const MODELS = [
  "gpt-4o",
  "gpt-4o-mini",
  "claude-3-5-sonnet",
  "claude-3-opus",
  "gemini-1.5-pro",
  "gpt-3.5-turbo",
];

const PROVIDERS = ["openai", "anthropic", "google"];

const AGENT_NAMES = [
  "Customer Support Bot",
  "Sales Outreach Agent",
  "Research Assistant",
];

function randInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randFloat(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

async function main() {
  console.log("Seeding demo data...\n");

  // --- 1. Demo Organization ---
  const org = await prisma.organization.upsert({
    where: { slug: "demo-org" },
    update: {},
    create: {
      name: "Demo Organization",
      slug: "demo-org",
      tier: OrgTier.STARTUP,
      dailyBudget: 50,
      monthlyBudget: 1000,
      subscriptionStatus: "ACTIVE",
      subscriptionTier: "FREE",
    },
  });
  console.log(`Organization: ${org.name} (${org.id})`);

  // --- 2. Demo User ---
  const userEmail = "demo@whoai.ai";
  const user = await prisma.user.upsert({
    where: { email: userEmail },
    update: {},
    create: {
      email: userEmail,
      fullName: "Demo User",
      role: "OWNER",
      organizationId: org.id,
    },
  });
  console.log(`User: ${user.fullName} (${user.email})`);

  // --- 3. Demo Agents ---
  const agents = [];
  const rawApiKeys: string[] = [];
  for (const name of AGENT_NAMES) {
    const rawKey = `whoai_sk_${crypto.randomBytes(32).toString("hex")}`;
    const hashedKey = crypto.createHash("sha256").update(rawKey).digest("hex");
    rawApiKeys.push(rawKey);

    const agent = await prisma.agent.upsert({
      where: { clientId: `demo-${name.toLowerCase().replace(/\s+/g, "-")}` },
      update: {},
      create: {
        name,
        organizationId: org.id,
        clientId: `demo-${name.toLowerCase().replace(/\s+/g, "-")}`,
        clientSecret: "hashed-secret-placeholder",
        apiKey: hashedKey,
        status: AgentStatus.ACTIVE,
        dailyBudget: 20,
        monthlyBudget: 200,
      },
    });
    agents.push(agent);
    console.log(`Agent: ${agent.name} (${agent.id})`);
    console.log(`  Raw API Key: ${rawKey}`);
  }

  // --- 4. Seed SpendLog (500 entries over 14 days) ---
  const spendCount = await prisma.spendLog.count({
    where: { organizationId: org.id },
  });

  if (spendCount === 0) {
    const now = new Date();
    const logs = [];
    for (let i = 0; i < 500; i++) {
      const daysAgo = randInt(0, 13);
      const hoursAgo = randInt(0, 23);
      const minutesAgo = randInt(0, 59);
      const createdAt = new Date(now);
      createdAt.setDate(createdAt.getDate() - daysAgo);
      createdAt.setHours(createdAt.getHours() - hoursAgo);
      createdAt.setMinutes(createdAt.getMinutes() - minutesAgo);

      const tokensIn = randInt(100, 4000);
      const tokensOut = randInt(50, 2000);
      const cost = parseFloat((tokensIn * 0.000005 + tokensOut * 0.000015).toFixed(8));

      logs.push({
        agentId: pick(agents).id,
        organizationId: org.id,
        model: pick(MODELS),
        provider: pick(PROVIDERS),
        tokensIn,
        tokensOut,
        cost,
        createdAt,
      });
    }

    // Batch insert in chunks of 100
    const chunkSize = 100;
    for (let i = 0; i < logs.length; i += chunkSize) {
      await prisma.spendLog.createMany({
        data: logs.slice(i, i + chunkSize),
        skipDuplicates: true,
      });
    }
    console.log(`Created ${logs.length} SpendLog entries`);
  } else {
    console.log(`Skipped SpendLog seed (already has ${spendCount} entries)`);
  }

  // --- 5. Seed RequestLog ---
  const reqCount = await prisma.requestLog.count({
    where: { organizationId: org.id },
  });

  if (reqCount === 0) {
    const now = new Date();
    const requests = [];
    for (let i = 0; i < 200; i++) {
      const daysAgo = randInt(0, 13);
      const hoursAgo = randInt(0, 23);
      const timestamp = new Date(now);
      timestamp.setDate(timestamp.getDate() - daysAgo);
      timestamp.setHours(timestamp.getHours() - hoursAgo);

      requests.push({
        agentId: pick(agents).id,
        organizationId: org.id,
        provider: pick(PROVIDERS),
        model: pick(MODELS),
        requestPayloadSize: randInt(100, 5000),
        statusCode: Math.random() > 0.05 ? 200 : randInt(400, 503),
        latencyMs: randInt(120, 2800),
        timestamp,
      });
    }

    const chunkSize = 100;
    for (let i = 0; i < requests.length; i += chunkSize) {
      await prisma.requestLog.createMany({
        data: requests.slice(i, i + chunkSize),
        skipDuplicates: true,
      });
    }
    console.log(`Created ${requests.length} RequestLog entries`);
  } else {
    console.log(`Skipped RequestLog seed (already has ${reqCount} entries)`);
  }

  // --- 6. Seed Alerts ---
  const alertCount = await prisma.alert.count({
    where: { organizationId: org.id },
  });

  if (alertCount === 0) {
    await prisma.alert.createMany({
      data: [
        {
          organizationId: org.id,
          agentId: agents[0].id,
          type: "ANOMALY",
          severity: "HIGH",
          title: "Spend spike detected",
          message: "Customer Support Bot spend increased 340% in 1 hour",
          resolved: false,
          createdAt: new Date(),
        },
        {
          organizationId: org.id,
          type: "BUDGET",
          severity: "MEDIUM",
          title: "Daily budget threshold",
          message: "Sales Outreach Agent is at 85% of daily budget",
          resolved: false,
          createdAt: new Date(Date.now() - 1000 * 60 * 60 * 2),
        },
      ],
    });
    console.log("Created 2 demo alerts");
  } else {
    console.log(`Skipped Alert seed (already has ${alertCount} entries)`);
  }

  // --- 7. Update org spend counters ---
  const totalSpend = await prisma.spendLog.aggregate({
    where: { organizationId: org.id },
    _sum: { cost: true },
  });

  await prisma.organization.update({
    where: { id: org.id },
    data: {
      currentDailySpend: parseFloat((totalSpend._sum.cost ?? 0).toString()) * 0.1,
      currentMonthlySpend: parseFloat((totalSpend._sum.cost ?? 0).toString()),
    },
  });
  console.log("Updated org spend counters");

  console.log("\nSeed complete! Sign in as demo@whoai.ai to view the dashboard.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
