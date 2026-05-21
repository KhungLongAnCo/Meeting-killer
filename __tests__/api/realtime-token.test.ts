import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/realtime-token/route';

vi.mock('@/lib/getUserApiKey', () => ({
  getUserApiKey: vi.fn().mockResolvedValue('sk-test')
}));

global.fetch = vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({ client_secret: { value: 'test-secret' } })
});

describe('Realtime Token API (/api/realtime-token)', () => {
  describe('POST', () => {
    it('returns client secret', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ targetLang: 'vi' })
      });

      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.client_secret.value).toBe('test-secret');
    });
  });
});
