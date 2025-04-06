import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import baseConfig from '../base/vite.base';

export default defineConfig({
  ...baseConfig,
  plugins: [react()],
  server: {
    ...baseConfig.server,
    port: 3003 // Unique port for this demo
  }
});
