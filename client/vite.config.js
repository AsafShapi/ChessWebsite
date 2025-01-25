import path from 'path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const proxyPaths = [
  "/api",
  "/auth/google",
  "/auth/local",
  "/auth/username",
  "/socket.io",
]
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    proxy: proxyPaths.reduce((acc, path) => {
      acc[path] = {
          target: 'http://localhost:5000',
          changeOrigin: false,
          ws: path === '/socket.io'
      };
      return acc;
    }, {}
    ),
  },
  build: {
    outDir: 'dist',
    sourcemap: false
  }
});
