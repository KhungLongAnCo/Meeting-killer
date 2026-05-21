import { describe, it, expect, vi } from 'vitest';
import { GET, POST, DELETE } from '@/app/api/auth/route';
import { prismaMock } from '@/lib/__mocks__/prisma';
import { scryptSync } from 'crypto';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn((name) => name === 'auth_token' ? { value: 'token' } : { value: 'admin' }),
    set: vi.fn(),
    delete: vi.fn(),
  })),
}));

describe('Auth API (/api/auth)', () => {
  describe('GET', () => {
    it('returns authenticated user if session valid', async () => {
      const res = await GET();
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.authenticated).toBe(true);
      expect(data.username).toBe('admin');
    });
  });

  describe('POST', () => {
    const salt = 'testsalt';
    const hash = scryptSync('password', salt, 64).toString('hex');

    it('authenticates correct password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: '1', username: 'admin', password: `${salt}:${hash}`, createdAt: new Date() });
      
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'password' })
      });

      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
    });

    it('rejects incorrect password', async () => {
      prismaMock.user.findUnique.mockResolvedValue({ id: '1', username: 'admin', password: `${salt}:${hash}`, createdAt: new Date() });
      
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ username: 'admin', password: 'wrong' })
      });

      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(401);
      expect(data.error).toBe('Invalid credentials');
    });
  });

  describe('DELETE', () => {
    it('logs out user', async () => {
      const res = await DELETE();
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.ok).toBe(true);
    });
  });
});
