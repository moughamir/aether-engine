import { defineConfig } from 'vite';
import path from 'path';

export default defineConfig({
  resolve: {
    alias: {
      '@aether/core': path.resolve(__dirname, '../../../packages/aether-core/src'),
      '@aether/shared': path.resolve(__dirname, '../../../packages/aether-shared/src'),
      '@aether/react': path.resolve(__dirname, '../../../packages/aether-react/src')
    }
  },
  server: {
    port: 3000,
    open: true
  }
});
