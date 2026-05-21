import { describe, it, expect, vi, beforeEach } from 'vitest';
import { POST } from '@/app/api/translate/route';
import { prismaMock } from '@/lib/__mocks__/prisma';

vi.mock('openai', () => {
  return {
    default: class OpenAI {
      chat = {
        completions: {
          create: vi.fn().mockResolvedValue({
            choices: [{ message: { content: 'Xin chao' } }]
          })
        }
      };
    }
  };
});

vi.mock('@/lib/getUserApiKey', () => ({
  getUserApiKey: vi.fn().mockResolvedValue('sk-test')
}));

describe('Translate API (/api/translate)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST', () => {
    it('translates text and saves entry', async () => {
      prismaMock.entry.create.mockResolvedValue({ id: '1' } as any);

      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ text: 'Hello', sourceLang: 'en', targetLang: 'vi', sessionId: 's1' })
      });

      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.translatedText).toBe('Xin chao');
      expect(prismaMock.entry.create).toHaveBeenCalled();
    });

    it('returns 400 if text is missing', async () => {
      const req = new Request('http://localhost', {
        method: 'POST',
        body: JSON.stringify({ sourceLang: 'en' })
      });

      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(400);
      expect(data.error).toBe('Text is required');
    });
  });
});
