import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    strictPort: true,
    watch: {
      // Windows can temporarily lock files while editors or antivirus scan them.
      usePolling: process.platform === 'win32',
      interval: 400,
      ignored: ['**/work/**', '**/docs/**', '**/coverage/**'],
    },
  },
  build: {
    rollupOptions: {
      output: {
        onlyExplicitManualChunks: true,
        manualChunks(id) {
          const path = id.replaceAll('\\', '/')
          if (
            /node_modules\/(react|react-dom|scheduler|react-router|react-router-dom)\//.test(path)
          )
            return 'react-vendor'
          if (/node_modules\/three\//.test(path)) return 'three-core'
          if (/node_modules\/(@react-three|three-stdlib)\//.test(path)) return 'three-scene'
        },
      },
    },
  },
  test: {
    environment: 'jsdom',
    maxWorkers: 3,
    testTimeout: 15000,
    setupFiles: ['./src/tests/setup.ts'],
    css: false,
    clearMocks: true,
  },
})
