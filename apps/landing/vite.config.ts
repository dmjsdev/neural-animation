import { defineConfig } from 'vite';
import path from 'node:path';

export default defineConfig({
  server: {
    port: 5174,
    open: true,
    fs: { allow: ['..'] }
  },
  resolve: {
    alias: {
      'neural-animation': path.resolve(__dirname, '../../src/index.ts')
    }
  }
});
