import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    allowedHosts: ['host.docker.internal'],
    proxy: {
      '/api': process.env.VITE_API_PROXY_TARGET ?? 'http://backend:8000',
    },
  },
})
