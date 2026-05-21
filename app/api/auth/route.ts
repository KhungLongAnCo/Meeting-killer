import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { scryptSync, randomBytes } from 'crypto';
import { cookies } from 'next/headers';

function verifyPassword(stored: string, supplied: string): boolean {
  const [salt, hash] = stored.split(':');
  const suppliedHash = scryptSync(supplied, salt, 64).toString('hex');
  return hash === suppliedHash;
}

// POST /api/auth — login
export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();
    if (!username || !password) {
      return NextResponse.json({ error: 'Missing credentials' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { username } });
    if (!user || !verifyPassword(user.password, password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Create a session token
    const token = randomBytes(32).toString('hex');

    const response = NextResponse.json({ ok: true, username: user.username });
    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    response.cookies.set('auth_user', user.username, {
      httpOnly: false, // readable by client
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 7,
    });

    return response;
  } catch (err) {
    console.error('Auth error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// GET /api/auth — check if authenticated
export async function GET() {
  const cookieStore = await cookies();
  const token = cookieStore.get('auth_token');
  const user = cookieStore.get('auth_user');

  if (!token?.value) {
    return NextResponse.json({ authenticated: false }, { status: 401 });
  }

  return NextResponse.json({ authenticated: true, username: user?.value || '' });
}

// DELETE /api/auth — logout
export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.set('auth_token', '', { path: '/', maxAge: 0 });
  response.cookies.set('auth_user', '', { path: '/', maxAge: 0 });
  return response;
}
