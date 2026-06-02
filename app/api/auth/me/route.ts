import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";
import { cookies } from "next/headers";

export async function GET(req: Request) {
  try {
    const cookieStore = await cookies();
    let token = cookieStore.get("whoai_auth")?.value;

    if (!token) {
      const auth = req.headers.get("authorization");
      if (auth && auth.startsWith("Bearer ")) {
        token = auth.replace("Bearer ", "");
      }
    }

    if (!token) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const payload =
      verifyToken(token);

    if (!payload || typeof payload !== "object" || !("userId" in payload) || typeof payload.userId !== "string") {
      return Response.json(
        { error: "Invalid token" },
        { status: 401 }
      );
    }

    const user =
      await prisma.user.findUnique({
        where: {
          id: payload.userId,
        },
        select: {
          id: true,
          email: true,
          role: true,
          createdAt: true,
        },
      });

    if (!user) {
      return Response.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    return Response.json(user);
  } catch (error) {
    console.error(error);

    return Response.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
