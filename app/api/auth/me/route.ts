import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

export async function GET(req: Request) {
  try {
    const auth =
      req.headers.get("authorization");

    if (!auth) {
      return Response.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const token = auth.replace(
      "Bearer ",
      ""
    );

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
          name: true,
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
