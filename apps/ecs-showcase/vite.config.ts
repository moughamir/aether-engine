import { defineConfig } from 'vite';
import baseConfig from '../base/vite.base';

export default defineConfig({
  ...baseConfig,
  server: {
    ...baseConfig.server,
    port: 3001
  }
});
