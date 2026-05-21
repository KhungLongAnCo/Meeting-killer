import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const { sessionId, originalText, translatedText, latencyMs } = await request.json();
    if (!sessionId || !originalText || !translatedText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const entry = await prisma.entry.create({
      data: {
        sessionId,
        originalText,
        translatedText,
        latencyMs: latencyMs || null,
      }
    });

    return NextResponse.json(entry);
  } catch (error: any) {
    console.error('Failed to save entry:', error);
    return NextResponse.json({ error: 'Failed to save entry' }, { status: 500 });
  }
}
