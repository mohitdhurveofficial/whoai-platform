import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.NEXTAUTH_SECRET;

export async function getAuthSession() {
  if (!JWT_SECRET) throw new Error("JWT_SECRET is not defined");
  const cookieStore = await cookies();
  const token = cookieStore.get("whoai_auth")?.value;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      organizationId: string;
    };
    return {
      userId: decoded.userId,
      organizationId: decoded.organizationId,
    };
  } catch (error) {
    return null;
  }
}