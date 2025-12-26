import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

// PUBLIC_INTERFACE
export default defineConfig({
  /** Vite config for the React + TypeScript SPA using SWC for fast dev builds. */
  plugins: [react()],
  server: {
    open: true, // open browser on start
    strictPort: false, // allow next available port if busy; set true if strict port needed
    port: 3000,
  },
  preview: {
    open: true,
    port: 4173,
  },
  base: '/', // serve from root
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
  resolve: {
    alias: {},
  },
});
