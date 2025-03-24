
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
  server: {
    port: 8080,
    // Using a wildcard to allow all hosts, which will prevent the blocked request errors
    // even if the specific domain changes
    allowedHosts: ['*.lovableproject.com', '*.lovable.app', 'localhost'],
  },
  build: {
    rollupOptions: {
      onwarn(warning, warn) {
        // More comprehensive suppression of TS6310 errors
        if (
          warning.code === 'PLUGIN_WARNING' && 
          warning.message && 
          (warning.message.includes('TS6310') || 
           warning.message.includes('may not disable emit'))
        ) {
          return;
        }
        warn(warning);
      }
    }
  }
})
