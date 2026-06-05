import jwt from "jsonwebtoken";
import type { User } from "@prisma/client";

export type AppSessionUser = Pick<
  User,
  "id" | "email" | "role" | "organizationId"
>;
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export function createSessionToken(user: AppSessionUser) {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) throw new Error("NEXTAUTH_SECRET is not defined");

  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    secret,
    { expiresIn: "7d" },
  );
}

export const sessionCookieOptions = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  path: "/",
  maxAge: SESSION_MAX_AGE,
};
