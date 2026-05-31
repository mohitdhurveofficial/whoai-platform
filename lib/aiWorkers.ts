import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

type AIWorkerCreateInput = {
  name: string;
  role: string;
  department?: string;
  owner?: string;
  description?: string;
};

async function getOrCreateDemoWorkspaceId() {
  return "demo-workspace";
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
  return {
    id: worker.id,
    name: worker.name,
    description: worker.description ?? "",
    role: worker.role,
    department: worker.department ?? "General",
    owner: worker.owner ?? "AI Operations",
    status: worker.status,
    riskScore: worker.riskScore,
    riskLevel: worker.riskLevel,
    confidenceScore: worker.confidenceScore,
    permissions: 0,
    decisionsToday: worker._count?.decisions ?? 0,
    createdAt: worker.createdAt.toISOString(),
    updatedAt: worker.createdAt.toISOString(),
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
  const workspaceId =
    await getOrCreateDemoWorkspaceId();

  const worker =
    await prisma.aIWorker.create({
      data: {
        workspaceId,
        name: data.name,
        role: data.role,
        department:
          data.department ?? "General",
        owner:
          data.owner ?? "AI Operations",
        description: data.description,
        status: "ACTIVE",
        riskScore: 0,
        confidenceScore: 0,
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
        department:
          data.department ?? undefined,
        owner:
          data.owner ?? undefined,
        description:
          data.description ?? undefined,
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
