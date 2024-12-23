import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig({
  plugins: [dts()],
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      formats: ['es'],
      fileName: 'index'
    },
    rollupOptions: {
      external: [
        'react',
        '@solana/web3.js',
        '@solana/wallet-adapter-base',
        '@solana/wallet-adapter-react',
        '@coze/api'
      ],
      output: {
        globals: {
          'react': 'React',
          '@solana/web3.js': 'SolanaWeb3',
          '@solana/wallet-adapter-base': 'WalletAdapterBase',
          '@solana/wallet-adapter-react': 'WalletAdapterReact',
          '@coze/api': 'CozeAPI'
        }
      }
    }
  }
}); 