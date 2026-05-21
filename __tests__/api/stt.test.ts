import { describe, it, expect, vi } from 'vitest';
import { POST } from '@/app/api/stt/route';

vi.mock('openai', () => {
  return {
    default: class OpenAI {
      audio = {
        transcriptions: {
          create: vi.fn().mockResolvedValue('Hello world')
        }
      };
    }
  };
});

describe('STT API (/api/stt)', () => {
  const originalEnv = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    process.env.OPENAI_API_KEY = 'sk-test';
  });

  afterEach(() => {
    process.env.OPENAI_API_KEY = originalEnv;
  });

  describe('POST', () => {
    it('transcribes audio', async () => {
      const formData = new FormData();
      formData.append('file', new Blob(['test']), 'audio.webm');

      const req = new Request('http://localhost', {
        method: 'POST',
        body: formData
      });

      const res = await POST(req);
      const data = await res.json();
      
      expect(res.status).toBe(200);
      expect(data.text).toBe('Hello world');
    });

    it('returns 400 if no file', async () => {
      const formData = new FormData();

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
