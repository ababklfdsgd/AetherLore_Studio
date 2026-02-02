import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: './', // Essential for Electron to load assets with relative paths
  define: {
    'process.env': process.env
  }
});