import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // Since we are testing API routes
    setupFiles: ['./__tests__/setup.ts'],
    alias: {
      '@': path.resolve(__dirname, './'),
    },
    coverage: {
      provider: 'v8',
      include: ['app/api/**/*.ts'],
    },
  },
});
