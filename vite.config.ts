import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react-swc'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const isWidget = mode === 'widget'
  
  return {
    plugins: [react()],
    build: isWidget ? {
      lib: {
        entry: './src/main-widget.tsx',
        name: 'MyWidget',
        fileName: 'my-widget',
        formats: ['iife']
      },
      rollupOptions: {
        external: [],
        output: {
          globals: {}
        }
      }
    } : {}
  }
})
