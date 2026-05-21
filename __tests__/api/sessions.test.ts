import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/sessions/route';
import { prismaMock } from '@/lib/__mocks__/prisma';

describe('Sessions API (/api/sessions)', () => {
  describe('POST', () => {
    it('creates a new session', async () => {
      const mockSession = { id: '1', title: 'Session', roomId: 'r1', sourceLang: 'en', targetLang: 'vi', model: 'test', createdAt: new Date(), updatedAt: new Date() };
      prismaMock.session.create.mockResolvedValue(mockSession);

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ roomId: 'r1', sourceLang: 'en', targetLang: 'vi', model: 'test' })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockSession);
    });

    it('creates a session with default values if fields are missing', async () => {
      const mockSession = { id: '2', title: 'Session Default', roomId: null, sourceLang: 'vi', targetLang: 'en', model: 'gemini-2.5-flash-lite', createdAt: new Date(), updatedAt: new Date() };
      prismaMock.session.create.mockResolvedValue(mockSession);

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockSession);
    });
  });
});
