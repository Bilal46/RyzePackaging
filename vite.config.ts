import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";
import { cssPreloadPlugin } from "./vite-plugin-css-preload";
import { resourceHintsPlugin } from "./vite-plugin-resource-hints";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(), 
    mode === "development" && componentTagger(),
    // Temporarily disable plugins to fix white screen
    // cssPreloadPlugin(),
    resourceHintsPlugin(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    sourcemap: true,
    cssCodeSplit: true,
    chunkSizeWarningLimit: 1000,
    // Optimize images
    assetsInlineLimit: 4096, // Inline images smaller than 4KB
    rollupOptions: {
      output: {
        // Optimize chunk splitting - ensure React loads first
        manualChunks: (id) => {
          // React core - put in vendor to ensure it loads with dependencies
          if (id.includes('node_modules/react/') || id.includes('node_modules/react-dom/')) {
            return 'vendor';
          }
          // React Router - depends on React
          if (id.includes('node_modules/react-router')) {
            return 'react-router';
          }
          // React Query - depends on React
          if (id.includes('node_modules/@tanstack/react-query')) {
            return 'react-query';
          }
          // UI libraries
          if (id.includes('node_modules/framer-motion')) {
            return 'framer-motion';
          }
          // Radix UI components (split by usage)
          if (id.includes('node_modules/@radix-ui')) {
            if (id.includes('dialog') || id.includes('alert-dialog')) {
              return 'radix-dialog';
            }
            if (id.includes('select') || id.includes('dropdown')) {
              return 'radix-select';
            }
            return 'radix-ui';
          }
          // Lucide icons (split by usage)
          if (id.includes('node_modules/lucide-react')) {
            return 'lucide-icons';
          }
          // Other vendor libraries
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk file names
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash].[ext]',
      },
    },
  },
  // Optimize CSS loading
  css: {
    devSourcemap: false,
  },
}));
