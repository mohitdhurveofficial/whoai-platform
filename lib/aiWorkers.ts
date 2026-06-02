import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type AIWorkerCreateInput = {
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

type AIWorkerWithDecisionCount = Prisma.AIWorkerGetPayload<{
  include: {
    _count: {
      select: {
        decisions: true;
      };
    };
  };
}>;

function normalizeAIWorker(worker: AIWorkerWithDecisionCount) {
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

export async function getAIWorkers() {
  const workers = await prisma.aIWorker.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          decisions: true,
        },
      },
    },
  });

  return workers.map(normalizeAIWorker);
}

export async function getAIWorkerById(id: string) {
  const worker = await prisma.aIWorker.findUnique({
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

  return normalizeAIWorker(worker);
}

export async function createAIWorker(
  data: AIWorkerCreateInput
) {
  const organizationId =
    await getOrCreateDemoWorkspaceId();

  const worker =
    await prisma.aIWorker.create({
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

  return normalizeAIWorker(worker);
}

export async function updateAIWorker(
  id: string,
  data: Partial<AIWorkerCreateInput> & {
    status?: string;
  }
) {
  const worker =
    await prisma.aIWorker.update({
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

  return normalizeAIWorker(worker);
}

export async function deleteAIWorker(
  id: string
) {
  return prisma.aIWorker.delete({
    where: { id },
  });
}
