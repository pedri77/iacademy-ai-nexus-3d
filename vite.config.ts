import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/iacademy-ai-nexus-3d/',
  build: { rollupOptions: { output: { manualChunks: { three: ['three'], react: ['react', 'react-dom'] } } } },
});
