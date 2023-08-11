import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueJsx from '@vitejs/plugin-vue-jsx'
import { mockServer } from './plugins/vite-plugin-mock-server'
const fs = require('fs')

// 通过 dev-ssl 命令开启 https 以支持通过域名访问
const openSSL = process.env?.npm_lifecycle_event === 'dev-ssl'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue(), vueJsx(), mockServer()],
  server: {
    host: openSSL,
    https: openSSL && {
      key: fs.readFileSync('plugins/cert/key.pem'),
      cert: fs.readFileSync('plugins/cert/cert.pem')
    },
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
