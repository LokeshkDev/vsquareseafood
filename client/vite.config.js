import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const backendTarget = env.VITE_BACKEND_URL || (env.VITE_API_URL ? env.VITE_API_URL.replace(/\/api\/v1\/?$/, '') : 'http://localhost:5000')

  return {
    plugins: [react()],
    server: {
      port: 3000,
      open: false,
      proxy: {
        '/api': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
        '/uploads': {
          target: backendTarget,
          changeOrigin: true,
          secure: false,
        },
      },
    },
  }
})

