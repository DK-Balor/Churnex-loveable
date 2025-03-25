
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { componentTagger } from "lovable-tagger"

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    host: "::",
    port: 8080,
    cors: true,
    allowedHosts: 'all', // Using 'all' as a string is valid in Vite 3+
  },
  build: {
    sourcemap: true,
    commonjsOptions: {
      transformMixedEsModules: true,
    },
    rollupOptions: {
      onwarn(warning, warn) {
        // Handle TypeScript configuration errors
        if (typeof warning === 'string') {
          if (warning.includes('TS6310') || warning.includes('disable emit')) {
            return;
          }
        }
        
        if (warning && typeof warning === 'object' && 'code' in warning && 'message' in warning) {
          if (
            warning.code === 'PLUGIN_WARNING' && 
            typeof warning.message === 'string' &&
            (warning.message.includes('TS6310') || 
             warning.message.includes('may not disable emit') ||
             warning.message.includes('tsconfig'))
          ) {
            return;
          }
        }
        
        warn(warning);
      }
    }
  },
  // Suppress TypeScript errors during build
  esbuild: {
    logOverride: {
      'this-is-undefined-in-esm': 'silent',
      'ts-error': 'silent'
    },
    tsconfigRaw: JSON.stringify({
      compilerOptions: {
        skipLibCheck: true,
        ignoreDeprecations: "5.0"
      }
    })
  }
}))
