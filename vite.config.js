import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react-swc';
import tsconfigPaths from 'vite-tsconfig-paths';
export default defineConfig({
    // Base path for GitHub Pages deployment
    // Change 'controller_tester' to your repository name
    base: '/controller_tester/',
    plugins: [react(), tsconfigPaths()],
    server: {
        port: 5173,
        open: true,
    },
    build: {
        // Optimize for production
        minify: 'esbuild',
        sourcemap: false,
        // Split chunks for better caching
        rollupOptions: {
            output: {
                manualChunks: {
                    vendor: ['react', 'react-dom', 'react-router-dom'],
                    motion: ['framer-motion'],
                    state: ['zustand'],
                },
            },
        },
    },
    test: {
        globals: true,
        environment: 'jsdom',
    },
});
