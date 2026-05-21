import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const room = await prisma.room.findUnique({
      where: { id },
      include: {
        sessions: {
          orderBy: { createdAt: 'asc' },
          include: {
            entries: { orderBy: { createdAt: 'asc' } },
          },
        },
      },
    });
    if (!room) {
      return NextResponse.json({ error: 'Room not found' }, { status: 404 });
    }
    return NextResponse.json(room);
  } catch (error: any) {
    console.error('Failed to fetch room:', error);
    return NextResponse.json({ error: 'Failed to fetch room' }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { name } = await req.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Name is required' }, { status: 400 });
    }
    const room = await prisma.room.update({
      where: { id },
      data: { name: name.trim() },
    });
    return NextResponse.json(room);
  } catch (error: any) {
    console.error('Failed to update room:', error);
    return NextResponse.json({ error: 'Failed to update room' }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.room.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (error: any) {
    console.error('Failed to delete room:', error);
    return NextResponse.json({ error: 'Failed to delete room' }, { status: 500 });
  }
}
