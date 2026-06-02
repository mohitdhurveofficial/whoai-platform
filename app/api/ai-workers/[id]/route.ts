import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const data = await request.json();

    const aiWorker = await prisma.aIWorker.update({
  where: { id },
  data: {
    name: data.name,
    status: data.status,
  },
});

    return NextResponse.json(aiWorker);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to update AI Worker' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.aIWorker.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to delete AI Worker' },
      { status: 500 }
    );
  }
}