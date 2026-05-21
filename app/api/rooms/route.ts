import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      orderBy: { updatedAt: 'desc' },
      include: {
        _count: { select: { sessions: true } },
        sessions: {
          include: { _count: { select: { entries: true } } },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });
    return NextResponse.json(rooms);
  } catch (error: any) {
    console.error('Failed to fetch rooms:', error);
    return NextResponse.json({ error: 'Failed to fetch rooms' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { name } = await request.json();
    if (!name?.trim()) {
      return NextResponse.json({ error: 'Room name is required' }, { status: 400 });
    }
    const room = await prisma.room.create({
      data: { name: name.trim() },
    });
    return NextResponse.json(room);
  } catch (error: any) {
    console.error('Failed to create room:', error);
    return NextResponse.json({ error: 'Failed to create room' }, { status: 500 });
  }
}
