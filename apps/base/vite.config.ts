import { defineConfig } from 'vite'
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@aether/core': path.resolve('../../packages/aether-core/src'),
      '@aether/shared': path.resolve('../../packages/aether-shared/src')
    }
  }
})
