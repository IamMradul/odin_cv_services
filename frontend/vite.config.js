import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://127.0.0.1:9000',
      '/ws': { target: 'ws://127.0.0.1:9000', ws: true },
      '/camera-ws': {
        target: 'wss://127.0.0.1:8000',
        ws: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/camera-ws/, '')
      }
    },
  },
})
