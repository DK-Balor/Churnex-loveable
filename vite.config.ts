
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // Suppress TS6310 error
        if (
          warning.code === 'PLUGIN_WARNING' && 
          warning.message && 
          warning.message.includes('TS6310')
        ) {
          return;
        }
        warn(warning);
      }
    }
  }
})
