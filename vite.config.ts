import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', 'VITE_');
    const isProduction = mode === 'production';
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        ...(isProduction ? {} : {
          proxy: {
            '/api': {
              target: 'https://citrus-expense-tracker.vercel.app',
              changeOrigin: true
            }
          }
        })
      },
      plugins: [react()],
      define: {
        'process.env.API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.VITE_GEMINI_API_KEY),
        'process.env.API_BASE_URL': JSON.stringify(env.VITE_API_BASE_URL || (isProduction ? 'https://citrus-expense-tracker.vercel.app/api' : '/api')),
        'process.env.FIREBASE_API_KEY': JSON.stringify(env.VITE_FIREBASE_API_KEY),
        'process.env.FIREBASE_AUTH_DOMAIN': JSON.stringify(env.VITE_FIREBASE_AUTH_DOMAIN),
        'process.env.FIREBASE_PROJECT_ID': JSON.stringify(env.VITE_FIREBASE_PROJECT_ID),
        'process.env.FIREBASE_STORAGE_BUCKET': JSON.stringify(env.VITE_FIREBASE_STORAGE_BUCKET),
        'process.env.FIREBASE_MESSAGING_SENDER_ID': JSON.stringify(env.VITE_FIREBASE_MESSAGING_SENDER_ID),
        'process.env.FIREBASE_APP_ID': JSON.stringify(env.VITE_FIREBASE_APP_ID)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      },
      
      // Production build optimizations
      build: {
        // Target modern browsers for smaller bundles
        target: 'es2020',
        
        // Enable minification
        minify: 'esbuild',
        
        // CSS code splitting
        cssCodeSplit: true,
        
        // Chunk size warnings at 500KB
        chunkSizeWarningLimit: 500,
        
        // Manual chunk splitting for better caching
        rollupOptions: {
          output: {
            manualChunks: {
              // Vendor chunks - split large libraries
              'vendor-charts': ['recharts'],
              'vendor-icons': ['lucide-react'],
              'vendor-utils': ['axios', 'react-window', 'react-virtualized-auto-sizer'],
            },
            // Optimize chunk file names
            chunkFileNames: isProduction 
              ? 'assets/[name]-[hash].js' 
              : 'assets/[name].js',
            entryFileNames: isProduction 
              ? 'assets/[name]-[hash].js' 
              : 'assets/[name].js',
            assetFileNames: isProduction 
              ? 'assets/[name]-[hash].[ext]' 
              : 'assets/[name].[ext]',
          },
        },
        
        // Enable source maps for debugging (disable in prod for smaller bundles)
        sourcemap: !isProduction,
      },
      
      // Optimize dependencies
      optimizeDeps: {
        include: ['react', 'react-dom', 'recharts', 'lucide-react', 'axios'],
      },
      
      // Enable CSS minification
      css: {
        devSourcemap: true,
      },
    };
});
