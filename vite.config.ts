import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    historyApiFallback: true,
    port: 5173,
    host: true
  },
  preview: {
    historyApiFallback: true,
    port: 4173,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom', 'react-router-dom'],
          admin: [
            './src/pages/admin/AdminLayout',
            './src/pages/admin/AdminDashboard',
            './src/pages/admin/AdminProducts',
            './src/pages/admin/AdminOrders'
          ]
        }
      }
    }
  }
});