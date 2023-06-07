import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { mockServer } from './plugins/vite-plugin-mock-server'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), mockServer()],
  server: {
    // 支持 wasm 数据隔离
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
