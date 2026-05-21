import { describe, it, expect, vi } from 'vitest';
import { GET, POST } from '@/app/api/settings/route';
import { prismaMock } from '@/lib/__mocks__/prisma';

vi.mock('next/headers', () => ({
  cookies: vi.fn(() => ({
    get: vi.fn(() => ({ value: 'test-admin' })),
  })),
}));

describe('Settings API (/api/settings)', () => {
  describe('GET', () => {
    it('fetches settings', async () => {
      const mockSettings = { id: '1', userId: 'u1', openaiApiKey: 'sk-test', deepgramApiKey: null, createdAt: new Date(), updatedAt: new Date() };
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', username: 'admin', password: 'pwd', createdAt: new Date(), setting: mockSettings } as any);
      prismaMock.setting.findUnique.mockResolvedValue(mockSettings);

      const res = await GET();
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ setting: mockSettings });
    });
  });

  describe('POST', () => {
    it('upserts settings', async () => {
      const mockSettings = { id: '1', userId: 'u1', openaiApiKey: 'sk-new', deepgramApiKey: null, createdAt: new Date(), updatedAt: new Date() };
      prismaMock.user.findUnique.mockResolvedValue({ id: 'u1', username: 'admin', password: 'pwd', createdAt: new Date() });
      prismaMock.setting.upsert.mockResolvedValue(mockSettings);

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ openaiApiKey: 'sk-new' })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual({ setting: mockSettings });
    });
  });
});
