
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [
    react({
      // Enhanced TypeScript options
      babel: {
        plugins: [],
        // Ensure TypeScript compatibility
        presets: [
          ['@babel/preset-env', { targets: { node: 'current' } }],
          '@babel/preset-typescript'
        ]
      }
    }),
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
    allowedHosts: ["de1a2121-ac1b-48af-b6bd-f70fda5830a0.lovableproject.com"]
  },
  build: {
    sourcemap: mode === 'development',
    outDir: 'dist',
    // Ensure TS references are handled properly
    rollupOptions: {
      external: [],
      output: {
        // Ensure clean module structure
        manualChunks: undefined
      }
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      // Improved CommonJS handling
      extensions: ['.js', '.jsx', '.ts', '.tsx']
    }
  },
  optimizeDeps: {
    esbuildOptions: {
      target: 'es2020',
      // Ensure proper TypeScript handling
      tsconfigRaw: {
        compilerOptions: {
          experimentalDecorators: true,
          target: 'es2020',
          useDefineForClassFields: true,
          module: 'esnext',
          moduleResolution: 'node',
          isolatedModules: true,
          noEmit: false, // Override noEmit to fix the reference issue
        }
      }
    }
  },
  esbuild: {
    target: 'es2020',
    // Enhanced TypeScript support
    tsconfigRaw: {
      compilerOptions: {
        target: 'es2020',
        module: 'esnext',
        noEmit: false // Explicitly override noEmit
      }
    }
  }
}));
