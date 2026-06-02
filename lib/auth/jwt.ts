import jwt from "jsonwebtoken";

export function verifyToken(
  token: string
) {
  try {
    return jwt.verify(
      token,
      process.env.NEXTAUTH_SECRET!
    );
  } catch {
    return null;
  }
}