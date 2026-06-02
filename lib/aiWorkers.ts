import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type AgentCreateInput = {
  name: string;
  environment: string;
};

async function getOrCreateDemoWorkspaceId() {
  const existing = await prisma.organization.findFirst({
    where: {
      slug: "demo-workspace",
    },
  });

  const organization =
    existing ??
    (await prisma.organization.create({
      data: {
        name: "Demo Workspace",
        slug: "demo-workspace",
      },
    }));

  return organization.id;
}


type AgentWithDecisionCount = Prisma.AgentGetPayload<{
  include: {
    _count: {
      select: {
        decisions: true;
      };
    };
  };
}>;

function normalizeAgent(worker: AgentWithDecisionCount) {
  const statusValue = worker.status ?? "ACTIVE";

  const status =
    statusValue.charAt(0).toUpperCase() +
    statusValue.slice(1).toLowerCase();

  return {
    id: worker.id,
    name: worker.name,
    environment: worker.environment,
    status,
    decisionsToday: worker._count?.decisions ?? 0,
    createdAt: worker.createdAt.toISOString(),
  };
}

export async function getAgents() {
  const workers = await prisma.agent.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          decisions: true,
        },
      },
    },
  });

  return workers.map(normalizeAgent);
}

export async function getAgentById(id: string) {
  const worker = await prisma.agent.findUnique({
    where: { id },
    include: {
      _count: {
        select: {
          decisions: true,
        },
      },
    },
  });

  if (!worker) {
    return null;
  }

  return normalizeAgent(worker);
}

export async function createAgent(
  data: AgentCreateInput
) {
  const organizationId =
    await getOrCreateDemoWorkspaceId();

  const worker =
    await prisma.agent.create({
      data: {
        organizationId: organizationId,
        name: data.name,
        environment: data.environment,
        agentToken: crypto.randomUUID(),
        status: "ACTIVE",
      },
      include: {
        _count: {
          select: {
            decisions: true,
          },
        },
      },
    });

  return normalizeAgent(worker);
}

export async function updateAgent(
  id: string,
  data: Partial<AgentCreateInput> & {
    status?: string;
  }
) {
  const worker =
    await prisma.agent.update({
      where: { id },
      data: {
        ...data,
        status: data.status,
      },
      include: {
        _count: {
          select: {
            decisions: true,
          },
        },
      },
    });

  return normalizeAgent(worker);
}

export async function deleteAgent(
  id: string
) {
  return prisma.agent.delete({
    where: { id },
  });
}
