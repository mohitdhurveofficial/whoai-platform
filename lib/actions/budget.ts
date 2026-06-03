"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleAgentKillSwitch(
  formData: FormData
): Promise<void> {
  const agentId = formData.get("agentId")?.toString();
  const currentStatus = formData.get("currentStatus")?.toString();

  if (!agentId || !currentStatus) {
    throw new Error("Missing agentId or currentStatus");
  }

  const newStatus =
    currentStatus === "ACTIVE"
      ? "SUSPENDED"
      : "ACTIVE";

  const agent = await prisma.agent.update({
    where: {
      id: agentId,
    },
    data: {
      status: newStatus,
    },
  });

  await prisma.auditLog.create({
    data: {
      organizationId: agent.organizationId,
      action:
        newStatus === "SUSPENDED"
          ? "AGENT_KILL_SWITCH_ENGAGED"
          : "AGENT_REACTIVATED",
      resource: agent.id,
      metadataJson: JSON.stringify({
        reason:
          "Manual executive override via FinOps Dashboard",
        timestamp: new Date().toISOString(),
      }),
    },
  });

  revalidatePath("/analytics");
}