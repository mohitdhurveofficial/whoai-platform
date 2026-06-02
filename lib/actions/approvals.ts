"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function updateApprovalStatus(id: string, status: "APPROVED" | "REJECTED") {
  try {
    const approval = await prisma.approval.update({
      where: { id },
      data: { status }
    });

    await prisma.decision.update({
      where: { id: approval.decisionId },
      data: { status }
    });

    revalidatePath("/approvals");
    revalidatePath("/dashboard");
    revalidatePath("/decisions");
  } catch (error) {
    console.error("Failed to update approval:", error);
  }
}