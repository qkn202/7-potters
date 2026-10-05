import { resolve } from 'path'
import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    host: '127.0.0.1',
    port: 5180,
    strictPort: false,
  },
  build: {
    target: 'es2022',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        online: resolve(__dirname, 'online.html'),
        single: resolve(__dirname, 'single.html'),
      },
    },
  },
})
