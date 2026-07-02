import { defineConfig, loadEnv, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

/** Doit correspondre à `PORT` dans `backend/.env` (souvent 5002). Surcharge : `VITE_API_PROXY_TARGET` dans `.env`. */
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiProxyTarget = env.VITE_API_PROXY_TARGET || 'http://127.0.0.1:5002'
  const mlProxyTarget = env.VITE_ML_PROXY_TARGET || 'http://127.0.0.1:8000'
  const grafanaProxyTarget = env.VITE_GRAFANA_PROXY_TARGET || 'http://127.0.0.1:3000'
  const n8nProxyTarget = env.VITE_N8N_PROXY_TARGET || 'http://127.0.0.1:5678'
  const base = env.VITE_BASE_PATH || '/'

  return {
  base,
  plugins: [
    {
      name: 'load-js-files-as-jsx',
      enforce: 'pre',
      async transform(code, id) {
        if (!/src\/.*\.js$/.test(id.replaceAll('\\', '/'))) return null

        const result = await transformWithOxc(code, id, {
          lang: 'jsx',
          jsx: {
            runtime: 'automatic',
          },
        })

        return {
          code: result.code,
          map: result.map,
        }
      },
    },
    react(),
  ],
  optimizeDeps: {
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
  build: {
    rolldownOptions: {
      moduleTypes: {
        '.js': 'jsx',
      },
    },
  },
  resolve: {
    alias: {
      '@services': path.resolve(__dirname, 'src/services'),
      '@hooks': path.resolve(__dirname, 'src/hooks'),
      '@layouts': path.resolve(__dirname, 'src/layouts'),
      '@components': path.resolve(__dirname, 'src/components'),
      '@pages': path.resolve(__dirname, 'src/pages'),
      '@contexts': path.resolve(__dirname, 'src/contexts'),
      '@utils': path.resolve(__dirname, 'src/utils'),
      '@assets': path.resolve(__dirname, 'src/assets'),
    },
  },
  server: {
    port: Number(env.PORT) || 3001,
    strictPort: true,
    host: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
        configure: (proxyServer) => {
          proxyServer.on('error', (err) => {
            console.error(`Vite proxy /api -> ${apiProxyTarget} error:`, err.message)
          })
        },
      },
      '/fastapi': {
        target: mlProxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/fastapi/, ''),
      },
      '/grafana': {
        target: grafanaProxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/grafana/, ''),
        configure: (proxyServer) => {
          proxyServer.on('error', (err) => {
            console.error(`Vite proxy /grafana -> ${grafanaProxyTarget} error:`, err.message)
          })
        },
      },
      '/n8n-webhook': {
        target: n8nProxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/n8n-webhook/, '/webhook'),
        configure: (proxyServer) => {
          proxyServer.on('error', (err) => {
            console.error(`Vite proxy /n8n-webhook -> ${n8nProxyTarget} error:`, err.message)
          })
        },
      },
      '/n8n-health': {
        target: n8nProxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: () => '/healthz',
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
  preview: {
    port: Number(env.PORT) || 3001,
    host: true,
    proxy: {
      '/api': {
        target: apiProxyTarget,
        changeOrigin: true,
        secure: false,
      },
      '/n8n-webhook': {
        target: n8nProxyTarget,
        changeOrigin: true,
        secure: false,
        rewrite: (path) => path.replace(/^\/n8n-webhook/, '/webhook'),
      },
    },
  },
  }
});

