import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    // Faster local startup / HMR
    warmup: {
      clientFiles: ['./src/main.jsx', './src/App.jsx'],
    },
  },
  build: {
    // Split large third-party libraries into separate, cacheable chunks
    rollupOptions: {
      output: {
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          vendor: ['axios', 'socket.io-client'],
        },
      },
    },
    chunkSizeWarningLimit: 800,
  },
})
