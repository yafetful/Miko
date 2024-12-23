import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  
  return {
    plugins: [react()],
    define: {
      'process.env': {
        REACT_APP_COZE_BASE_URL: JSON.stringify(env.REACT_APP_COZE_BASE_URL),
        REACT_APP_COZE_BOT_ID: JSON.stringify(env.REACT_APP_COZE_BOT_ID),
        REACT_APP_COZE_PAT: JSON.stringify(env.REACT_APP_COZE_PAT),
      },
      'global': {},
    },
    resolve: {
      alias: {
        process: resolve(__dirname, 'node_modules/process/browser.js'),
        stream: 'stream-browserify',
        buffer: 'buffer',
        util: 'util',
      },
    },
    optimizeDeps: {
      esbuildOptions: {
        define: {
          global: 'globalThis'
        }
      }
    },
    build: {
      rollupOptions: {
        plugins: [],
      },
    },
    server: {
      port: 3000,
      open: true
    },
  };
}); 