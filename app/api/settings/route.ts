import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { cookies } from 'next/headers';

export async function GET() {
  const cookieStore = await cookies();
  const username = cookieStore.get('auth_user')?.value;

  if (!username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { username },
      include: { setting: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ setting: user.setting || {} });
  } catch (error) {
    console.error('Failed to get settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const cookieStore = await cookies();
  const username = cookieStore.get('auth_user')?.value;

  if (!username) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { openaiApiKey, deepgramApiKey } = await request.json();

    const user = await prisma.user.findUnique({
      where: { username },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const updatedSetting = await prisma.setting.upsert({
      where: { userId: user.id },
      update: { openaiApiKey, deepgramApiKey },
      create: {
        userId: user.id,
        openaiApiKey,
        deepgramApiKey,
      },
    });

    return NextResponse.json({ setting: updatedSetting });
  } catch (error) {
    console.error('Failed to update settings:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
