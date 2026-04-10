import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), vueDevTools()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  // 3. Cấu hình Server
  server: {
    port: 5173, // Cổng mà Vite sẽ chạy
    host: true, // Cho phép truy cập qua IP nội bộ (ví dụ: 192.168.1.x)
    proxy: {
      // Khi bạn gọi tới /api, Vite sẽ chuyển hướng sang server backend
      '/api': {
        target: 'http://localhost:8000', // Chuyển tiếp các request /api về server backend
        changeOrigin: true,
      },
    },
  },
})
