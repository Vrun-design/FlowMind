import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
  return {
    server: {
      port: 3000,
      host: '0.0.0.0',
    },
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      }
    },
    base: './',
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './vitest.setup.ts',
      exclude: ['e2e/**', 'node_modules/**', 'dist/**'],
    },
  };
});
