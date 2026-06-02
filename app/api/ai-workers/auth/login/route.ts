import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();
  const jwtSecret = process.env.NEXTAUTH_SECRET;

  if (!jwtSecret) {
    return NextResponse.json(
      { error: "Authentication is not configured" },
      { status: 500 }
    );
  }

  const user = await prisma.user.findUnique({
    where: {
      email: body.email,
    },
    select: {
      id: true,
      email: true,
      password: true,
      role: true,
      organizationId: true,
      name: true,
    },
  });

  if (!user) {
    return NextResponse.json(
      { error: "User not found" },
      { status: 404 }
    );
  }

  const validPassword = await bcrypt.compare(
    body.password,
    user.password
  );

  if (!validPassword) {
    return NextResponse.json(
      { error: "Invalid password" },
      { status: 401 }
    );
  }

  const token = jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
    jwtSecret,
    {
      expiresIn: "7d",
    }
  );

  const response = NextResponse.json({
    success: true,
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
    },
  });

  response.cookies.set("whoai_auth", token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });

  return response;
}
