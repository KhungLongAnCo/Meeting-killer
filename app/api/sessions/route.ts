import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const sessions = await prisma.session.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        _count: {
          select: { entries: true }
        }
      }
    });
    return NextResponse.json(sessions);
  } catch (error: any) {
    console.error('Failed to fetch sessions:', error);
    return NextResponse.json({ error: 'Failed to fetch sessions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const data = await request.json();
    const session = await prisma.session.create({
      data: {
        title: data.title || `Session ${new Date().toLocaleString()}`,
        sourceLang: data.sourceLang || 'vi',
        targetLang: data.targetLang || 'en',
        model: data.model || 'gemini-2.5-flash-lite',
        roomId: data.roomId || null,
      }
    });
    return NextResponse.json(session);
  } catch (error: any) {
    console.error('Failed to create session:', error);
    return NextResponse.json({ error: 'Failed to create session' }, { status: 500 });
  }
}
