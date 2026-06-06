import crypto from "crypto";
import { prisma } from "@/lib/prisma";

export async function validateApiKey(key: string) {
  const hash = crypto
    .createHash("sha256")
    .update(key)
    .digest("hex");

  return prisma.apiKey.findFirst({
    where: {
      keyHash: hash,
      revoked: false,
    },
  });
}