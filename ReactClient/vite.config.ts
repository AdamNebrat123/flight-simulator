import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [react(), cesium()],
  server: {
    host: '0.0.0.0',
    open: true, // This will open the browser automatically
    allowedHosts: true,
    proxy: {
      // כל בקשה ל-/ws תעבור לשרת WebSocket הפנימי
      '/ws': {
        target: 'ws://localhost:5000', // או הכתובת הפנימית של השרת
        ws: true,                       // חשוב עבור WebSocket
        changeOrigin: true
      },
      // דוגמה גם ל-HTTP API
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
});