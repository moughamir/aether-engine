import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@aether/core': path.resolve(__dirname, '../../packages/aether-core/src'),
      '@aether/shared': path.resolve(__dirname, '../../packages/aether-shared/src')
    }
  }
})
