import { defineConfig } from 'vite';
import { resolve } from 'path';

// Proyecto multipágina: cada .html es una entrada independiente,
// tal como funcionaba el sitio estático original, pero ahora
// empaquetado, optimizado y servido por Vite.
export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        dashboard: resolve(__dirname, 'dashboard.html'),
        lecciones: resolve(__dirname, 'lecciones.html'),
        practica: resolve(__dirname, 'practica.html'),
        progreso: resolve(__dirname, 'progreso.html'),
        config: resolve(__dirname, 'config.html'),
      },
    },
  },
  server: {
    port: 5173,
    open: true,
  },
});
