import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/listen/route';
import { prismaMock } from '@/lib/__mocks__/prisma';

vi.mock('openai', () => {
  return {
    default: class OpenAI {
      audio = {
        transcriptions: {
          create: vi.fn().mockResolvedValue('Hello')
        }
      };
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

describe('Listen API (/api/listen)', () => {
  describe('POST', () => {
    it('transcribes and translates audio', async () => {
      prismaMock.entry.create.mockResolvedValue({ id: '1' } as any);

      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(200)]), 'audio.webm');
      formData.append('sourceLang', 'en');
      formData.append('targetLang', 'vi');
      formData.append('sessionId', 's1');

      const req = new Request('http://localhost', {
        method: 'POST',
        body: formData
      });

      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.text).toBe('Hello');
      expect(data.translatedText).toBe('Xin chao');
      expect(prismaMock.entry.create).toHaveBeenCalled();
    });

    it('returns 400 if audio too small', async () => {
      const formData = new FormData();
      formData.append('file', new Blob([new Uint8Array(10)]), 'audio.webm');

      const req = new Request('http://localhost', {
        method: 'POST',
        body: formData
      });

      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(400);
      expect(data.error).toBe('Audio file is required');
    });
  });
});
