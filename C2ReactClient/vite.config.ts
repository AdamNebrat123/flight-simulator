import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import cesium from 'vite-plugin-cesium';

export default defineConfig({
  plugins: [react(), cesium()],
  server: {
    host: '0.0.0.0',
    port: 5174,
    open: false, // open: true, will open the browser automatically
    allowedHosts: true,
    proxy: {
      // every request to /ws will be forwarded to the internal WebSocket server
      '/ws': {
         target: 'ws://localhost:5001', // the internal address of the server
          ws: true,                       // important for WebSocket
        changeOrigin: true
      },
      // Example for HTTP API (for now i dont use it)
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
});