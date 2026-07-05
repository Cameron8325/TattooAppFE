import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// JSX lives in .js files (CRA legacy). The esbuild/optimizeDeps loader
// settings below let Vite parse them without a mass .js -> .jsx rename,
// which keeps this migration reversible. Rename to .jsx incrementally
// during Phase 3 component passes if desired.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // match CRA so Django CORS_ALLOWED_ORIGINS keeps working
    open: false,
  },
  build: {
    outDir: 'build', // match CRA output path
    rollupOptions: {
      output: {
        // Split heavyweight vendors so no chunk crosses the 500 kB line
        // and app-code changes don't bust vendor cache.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router-dom'],
          mui: ['@mui/material', '@mui/icons-material'],
          datagrid: ['@mui/x-data-grid'],
          charts: ['recharts'],
          calendar: ['react-big-calendar', 'moment'],
        },
      },
    },
  },
  esbuild: {
    loader: 'jsx',
    include: /src\/.*\.js$/,
    exclude: [],
  },
  optimizeDeps: {
    esbuildOptions: {
      loader: { '.js': 'jsx' },
    },
  },
});
