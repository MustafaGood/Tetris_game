import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    // Ensure clean production builds
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: undefined
      }
    }
  },
  define: {
    // Ensure environment variables are properly defined
    'import.meta.env.PROD': JSON.stringify(process.env.NODE_ENV === 'production'),
    'import.meta.env.DEV': JSON.stringify(process.env.NODE_ENV === 'development')
  }
}) 