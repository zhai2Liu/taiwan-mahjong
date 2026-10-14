import { defineConfig } from 'vite';
export default defineConfig({ base: './', build: { outDir: 'site', rollupOptions: { input: ['index.html', 'training.html', 'learn.html'] } } });
