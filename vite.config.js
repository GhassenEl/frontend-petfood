import { defineConfig, transformWithOxc } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
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
    port: 3000,
    host: true,
    proxy: {
      '/api': {
        target: 'http://localhost:5002',
        changeOrigin: true,
        secure: false,
        // Helps avoid Vite proxy returning 502 when backend closes connection
        configure: (proxyServer) => {
          proxyServer.on('error', (err) => {
            console.error('Vite proxy /api error:', err);
          });
        },
      },
      '/fastapi': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
  css: {
    postcss: './postcss.config.js',
  },
})

