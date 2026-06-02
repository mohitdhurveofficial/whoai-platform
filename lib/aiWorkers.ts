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
  const existing = await prisma.organization.findFirst({
    where: {
      name: "Demo Workspace",
    },
  });

  const organization =
    existing ??
    (await prisma.organization.create({
      data: {
        name: "Demo Workspace",
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
  const riskLevelValue = worker.riskLevel ?? "LOW";
  const statusValue = worker.status ?? "ACTIVE";

  const riskLevel =
    riskLevelValue.charAt(0).toUpperCase() +
    riskLevelValue.slice(1).toLowerCase();

  const status =
    statusValue.charAt(0).toUpperCase() +
    statusValue.slice(1).toLowerCase();

  return {
    id: worker.id,
    name: worker.name,
    description: worker.description ?? "",
    department: worker.department ?? "General",
    status,
    riskLevel,
    decisionsToday: worker._count?.decisions ?? 0,
    successRate: worker.confidenceScore ?? 0,
    lastActivity: worker.createdAt.toISOString(),
    assignedPolicies: [],
    approvalRequirements:
      (worker.riskScore ?? 0) >= 70
        ? "Human approval required"
        : "Auto-approval eligible",
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
  const organizationId =
    await getOrCreateDemoWorkspaceId();

  const worker =
    await prisma.aIWorker.create({
      data: {
        workspaceId: organizationId,
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
