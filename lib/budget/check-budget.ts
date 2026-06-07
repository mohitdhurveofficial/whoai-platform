import { prisma } from "@/lib/prisma";
export async function checkBudget(
  organizationId: string
) {
  const org = await prisma.organization.findUnique({
    where: { id: organizationId }
  });

  console.log("BUDGET CHECK", {
    orgId: org?.id,
    monthlyBudget: org?.monthlyBudget,
    currentMonthlySpend: org?.currentMonthlySpend,
    status: org?.status
  });

  if (!org) {
    throw new Error("Organization not found");
  }

  if (
    org.monthlyBudget &&
    org.currentMonthlySpend >= org.monthlyBudget
  ) {
    return false;
  }

  return true;
}