import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => ({
  base: process.env.VITE_BASE_PATH || '/',
  plugins: [react()],
  server: {
    port: Number(process.env.FRONTEND_PORT || 5173),
    proxy: {
      '/api': {
        target: process.env.GATEWAY_URL || 'http://localhost:8000',
        changeOrigin: true
      }
    }
  },
  preview: {
    port: Number(process.env.FRONTEND_PORT || 5173),
    host: '0.0.0.0'
  }
}));
