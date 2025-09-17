import { defineConfig } from 'vite'

export default defineConfig({
  build: {
    rollupOptions: {
      input: './src/index.tsx',
      output: {
        entryFileNames: '_worker.js',
        format: 'es'
      }
    },
    outDir: 'dist',
    emptyOutDir: true,
    minify: true
  }
})