import { describe, it, expect } from 'vitest';
import { POST } from '@/app/api/entries/route';
import { prismaMock } from '@/lib/__mocks__/prisma';

describe('Entries API (/api/entries)', () => {
  describe('POST', () => {
    it('creates a new entry', async () => {
      const mockEntry = { id: '1', sessionId: 's1', originalText: 'Hello', translatedText: 'Xin chao', latencyMs: 100, createdAt: new Date() };
      prismaMock.entry.create.mockResolvedValue(mockEntry);

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 's1', originalText: 'Hello', translatedText: 'Xin chao', latencyMs: 100 })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data).toEqual(mockEntry);
    });

    it('returns 400 if missing fields', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ sessionId: 's1' })
      });

      const res = await POST(req);
      const data = await res.json();

      expect(res.status).toBe(400);
    });
  });
});
