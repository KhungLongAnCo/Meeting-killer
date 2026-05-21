import { vi } from 'vitest';
import '@/lib/__mocks__/prisma';

// Mock Next.js NextResponse
vi.mock('next/server', () => {
  return {
    NextResponse: {
      json: vi.fn((data, options) => {
        return {
          status: options?.status || 200,
          json: async () => data,
          cookies: { set: vi.fn(), delete: vi.fn() }
        };
      }),
    },
  };
});

// Polyfill missing globals if needed for testing APIs
if (typeof Request === 'undefined') {
  global.Request = class Request {} as any;
}
