// Vite Performance Optimization Configuration

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path'
import { visualizer } from 'rollup-plugin-visualizer'
import { splitVendorChunkPlugin } from 'vite'
import { compression } from 'vite-plugin-compression'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react({
      // Enable React Fast Refresh
      fastRefresh: true,
      // Optimize React production builds
      babel: {
        plugins: [
          // Remove console.log in production
          process.env.NODE_ENV === 'production' && ['transform-remove-console', { exclude: ['error', 'warn'] }],
          // Optimize React components
          ['babel-plugin-styled-components', { displayName: false, fileName: false }],
        ].filter(Boolean),
      },
    }),
    
    // Split vendor chunks for better caching
    splitVendorChunkPlugin(),
    
    // Gzip compression
    compression({
      algorithm: 'gzip',
      ext: '.gz',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    
    // Brotli compression for modern browsers
    compression({
      algorithm: 'brotliCompress',
      ext: '.br',
      threshold: 1024,
      deleteOriginFile: false,
    }),
    
    // Bundle analyzer
    process.env.ANALYZE && visualizer({
      filename: 'dist/stats.html',
      open: true,
      gzipSize: true,
      brotliSize: true,
    }),
    
    // Progressive Web App
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/api\./,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 100,
                maxAgeSeconds: 60 * 60 * 24, // 24 hours
              },
              cacheKeyWillBeUsed: async ({ request }) => {
                // Cache GET requests only
                return request.method === 'GET' ? request.url : null;
              },
            },
          },
          {
            urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'images-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
              },
            },
          },
          {
            urlPattern: /\.(?:woff|woff2|ttf|eot)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'fonts-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
            },
          },
        ],
      },
      manifest: {
        name: 'ERP System',
        short_name: 'ERP',
        description: 'Modern ERP System with AI/ML capabilities',
        theme_color: '#000000',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
          },
        ],
      },
    }),
  ],
  
  // Build optimizations
  build: {
    // Target modern browsers for smaller bundles
    target: 'es2020',
    
    // Optimize chunk size
    rollupOptions: {
      output: {
        // Manual chunk splitting for optimal caching
        manualChunks: {
          // Core React libraries
          'react-vendor': ['react', 'react-dom'],
          
          // Router and state management
          'router-vendor': ['@tanstack/react-router', 'zustand'],
          
          // Data fetching
          'query-vendor': ['@tanstack/react-query', 'axios'],
          
          // UI components
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-select',
            '@radix-ui/react-tabs',
            '@radix-ui/react-toast',
          ],
          
          // Charts and visualization
          'charts-vendor': ['recharts', 'd3'],
          
          // Form handling
          'forms-vendor': ['react-hook-form', 'zod'],
          
          // AI/ML specific libraries
          'ai-vendor': ['@tensorflow/tfjs', 'ml-matrix'],
          
          // Utilities
          'utils-vendor': ['date-fns', 'lodash-es', 'clsx'],
        },
        
        // Optimize chunk file names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
          if (facadeModuleId) {
            const fileName = facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            return `chunks/${fileName}-[hash].js`
          }
          return 'chunks/[name]-[hash].js'
        },
        
        // Optimize asset file names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || []
          const ext = info[info.length - 1]
          
          if (/\.(png|jpe?g|svg|gif|tiff|bmp|ico)$/i.test(assetInfo.name || '')) {
            return `images/[name]-[hash].${ext}`
          }
          
          if (/\.(woff2?|eot|ttf|otf)$/i.test(assetInfo.name || '')) {
            return `fonts/[name]-[hash].${ext}`
          }
          
          if (/\.css$/i.test(assetInfo.name || '')) {
            return `styles/[name]-[hash].${ext}`
          }
          
          return `assets/[name]-[hash].${ext}`
        },
      },
      
      // External dependencies (CDN)
      external: process.env.NODE_ENV === 'production' ? [
        // Externalize large libraries for CDN loading
        // 'react',
        // 'react-dom',
      ] : [],
    },
    
    // Source maps for debugging
    sourcemap: process.env.NODE_ENV === 'development',
    
    // Minification
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: process.env.NODE_ENV === 'production',
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.info'],
      },
      mangle: {
        safari10: true,
      },
      format: {
        comments: false,
      },
    },
    
    // Chunk size warnings
    chunkSizeWarningLimit: 1000,
    
    // CSS code splitting
    cssCodeSplit: true,
    
    // Asset inlining threshold
    assetsInlineLimit: 4096,
  },
  
  // Development server optimizations
  server: {
    // Enable HTTP/2
    https: false,
    
    // Optimize HMR
    hmr: {
      overlay: true,
    },
    
    // Proxy API requests
    proxy: {
      '/api': {
        target: process.env.VITE_API_URL || 'http://localhost:8000',
        changeOrigin: true,
        secure: false,
      },
      '/ws': {
        target: process.env.VITE_WS_URL || 'ws://localhost:8000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
  
  // Dependency optimization
  optimizeDeps: {
    // Include dependencies that should be pre-bundled
    include: [
      'react',
      'react-dom',
      '@tanstack/react-router',
      '@tanstack/react-query',
      'zustand',
      'axios',
      'date-fns',
      'clsx',
      'lucide-react',
    ],
    
    // Exclude dependencies from pre-bundling
    exclude: [
      // Large libraries that are better loaded separately
      '@tensorflow/tfjs',
    ],
    
    // Force optimization of specific dependencies
    force: process.env.NODE_ENV === 'development',
  },
  
  // Path resolution
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@hooks': resolve(__dirname, './src/hooks'),
      '@utils': resolve(__dirname, './src/utils'),
      '@types': resolve(__dirname, './src/types'),
      '@api': resolve(__dirname, './src/api'),
      '@stores': resolve(__dirname, './src/stores'),
      '@assets': resolve(__dirname, './src/assets'),
    },
  },
  
  // CSS optimizations
  css: {
    // CSS modules
    modules: {
      localsConvention: 'camelCase',
    },
    
    // PostCSS optimizations
    postcss: {
      plugins: [
        // Autoprefixer for browser compatibility
        require('autoprefixer'),
        
        // CSS optimization in production
        ...(process.env.NODE_ENV === 'production' ? [
          require('cssnano')({
            preset: ['default', {
              discardComments: { removeAll: true },
              normalizeWhitespace: true,
              colormin: true,
              convertValues: true,
              discardDuplicates: true,
              discardEmpty: true,
              mergeRules: true,
              minifyFontValues: true,
              minifyParams: true,
              minifySelectors: true,
              reduceIdents: false, // Keep for debugging
              svgo: true,
            }],
          }),
        ] : []),
      ],
    },
    
    // CSS preprocessing
    preprocessorOptions: {
      scss: {
        additionalData: `@import "@/styles/variables.scss";`,
      },
    },
  },
  
  // Environment variables
  define: {
    __APP_VERSION__: JSON.stringify(process.env.npm_package_version),
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
  },
  
  // Preview server (for production builds)
  preview: {
    port: 3000,
    host: true,
  },
  
  // Experimental features
  experimental: {
    // Enable build optimizations
    renderBuiltUrl: (filename, { hostType }) => {
      if (hostType === 'js') {
        return { js: `/${filename}` }
      } else {
        return { css: `/${filename}` }
      }
    },
  },
})

// Performance monitoring configuration
export const performanceConfig = {
  // Web Vitals thresholds
  vitals: {
    FCP: 1800,  // First Contentful Paint (ms)
    LCP: 2500,  // Largest Contentful Paint (ms)
    FID: 100,   // First Input Delay (ms)
    CLS: 0.1,   // Cumulative Layout Shift
    TTFB: 800,  // Time to First Byte (ms)
  },
  
  // Bundle size limits
  bundleSize: {
    maxSize: 1000, // KB
    warningSize: 800, // KB
  },
  
  // Performance monitoring
  monitoring: {
    enabled: process.env.NODE_ENV === 'production',
    sampleRate: 0.1, // 10% of users
    reportingEndpoint: '/api/performance',
  },
}
