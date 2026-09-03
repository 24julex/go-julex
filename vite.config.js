import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

const projectDir = path.resolve();

export default defineConfig({
  root: projectDir,
  plugins: [react()],
  resolve: {
    preserveSymlinks: true,
    alias: {
      '@': path.resolve(projectDir, 'src'),
    },
  },
  server: {
    port: 3000,
    open: false,
    host: true,
    fs: {
      strict: false,
      allow: [projectDir]
    }
  },
  optimizeDeps: {
    include: [
      'react',
      'react-dom',
      'react-router-dom',
      'lucide-react',
      'recharts',
      'clsx',
      'tailwind-merge',
      'canvas-confetti'
    ]
  }
});
