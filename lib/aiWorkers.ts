import { prisma } from "@/lib/prisma";

type AIWorkerCreateInput = {
  name: string;
  role: string;
  department?: string;
  owner?: string;
  description?: string;
};

async function getOrCreateDemoWorkspaceId() {
  const workspace = await prisma.workspace.findFirst();

  if (workspace) {
    return workspace.id;
  }

  const organization = await prisma.organization.create({
    data: {
      name: "Demo Organization",
      slug: "demo",
      complianceLevel: "standard",
      riskScore: 50,
    },
  });

  const newWorkspace = await prisma.workspace.create({
    data: {
      organizationId: organization.id,
      name: "Demo Workspace",
      slug: "demo",
      description: "Workspace created for WhoAI demo data",
      type: "DEMO",
      isDemo: true,
    },
  });

  return newWorkspace.id;
}

function normalizeAIWorker(worker: any) {
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
    permissions: worker._count?.permissions ?? 0,
    decisionsToday: worker._count?.decisions ?? 0,
    createdAt: worker.createdAt.toISOString(),
    updatedAt: worker.updatedAt.toISOString(),
  };
}

export async function getAIWorkers() {
  const workers = await prisma.aIWorker.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { permissions: true, decisions: true } } },
  });

  return workers.map(normalizeAIWorker);
}

export async function getAIWorkerById(id: string) {
  const worker = await prisma.aIWorker.findUnique({
    where: { id },
    include: { _count: { select: { permissions: true, decisions: true } } },
  });

  if (!worker) {
    return null;
  }

  return normalizeAIWorker(worker);
}

export async function createAIWorker(data: AIWorkerCreateInput) {
  const workspaceId = await getOrCreateDemoWorkspaceId();

  const worker = await prisma.aIWorker.create({
    data: {
      workspaceId,
      name: data.name,
      role: data.role,
      department: data.department ?? "General",
      owner: data.owner ?? "AI Operations",
      description: data.description,
      status: "ACTIVE",
      riskScore: 0,
      confidenceScore: 0,
    },
    include: { _count: { select: { permissions: true, decisions: true } } },
  });

  return normalizeAIWorker(worker);
}

export async function updateAIWorker(id: string, data: Partial<AIWorkerCreateInput> & { status?: string }) {
  const worker = await prisma.aIWorker.update({
    where: { id },
    data: {
      ...data,
      department: data.department ?? undefined,
      owner: data.owner ?? undefined,
      description: data.description ?? undefined,
      status: data.status as any,
    },
    include: { _count: { select: { permissions: true, decisions: true } } },
  });

  return normalizeAIWorker(worker);
}

export async function deleteAIWorker(id: string) {
  return prisma.aIWorker.delete({ where: { id } });
}

// ============================================================================
// AI WORKER IDENTITY CRUD
// ============================================================================

export async function getAIWorkerIdentity(aiWorkerId: string) {
  return prisma.aIWorkerIdentity.findUnique({
    where: { aiWorkerId },
  });
}

export async function createAIWorkerIdentity(aiWorkerId: string, workerId: string) {
  return prisma.aIWorkerIdentity.create({
    data: {
      aiWorkerId,
      workerId,
      authState: "authenticated",
      lastActivity: new Date(),
    },
  });
}

export async function updateAIWorkerIdentity(aiWorkerId: string, data: { authState?: string; lastActivity?: Date }) {
  return prisma.aIWorkerIdentity.update({
    where: { aiWorkerId },
    data,
  });
}

// ============================================================================
// AI PERMISSIONS CRUD
// ============================================================================

type PermissionInput = {
  action: string;
  resource: string;
  scope?: string;
  isGranted: boolean;
};

export async function getAIWorkerPermissions(aiWorkerId: string) {
  return prisma.aIPermission.findMany({
    where: { aiWorkerId },
    orderBy: { createdAt: "desc" },
  });
}

export async function grantAIPermission(aiWorkerId: string, permission: PermissionInput) {
  return prisma.aIPermission.upsert({
    where: {
      aiWorkerId_action_resource: {
        aiWorkerId,
        action: permission.action as any,
        resource: permission.resource as any,
      },
    },
    update: {
      isGranted: permission.isGranted,
      scope: permission.scope,
    },
    create: {
      aiWorkerId,
      action: permission.action as any,
      resource: permission.resource as any,
      scope: permission.scope,
      isGranted: permission.isGranted,
    },
  });
}

export async function revokeAIPermission(aiWorkerId: string, action: string, resource: string) {
  return prisma.aIPermission.delete({
    where: {
      aiWorkerId_action_resource: {
        aiWorkerId,
        action: action as any,
        resource: resource as any,
      },
    },
  });
}
