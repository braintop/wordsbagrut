import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Add baseUrl - update this to match your deployment path if needed
  base: './',
  build: {
    // Generate sourcemaps for easier debugging
    sourcemap: true,
    // Do not minify for easier debugging
    minify: true,
  },
  server: {
    // Configure headers to prevent caching issues
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  },
  // Custom manifest to help with cache invalidation
  optimizeDeps: {
    force: true // Force dependencies pre-bundling
  },
})
