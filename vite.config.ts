import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

export default defineConfig(() => ({
  plugins: [dyadComponentTagger(), 
    react({
      // Allow JSX namespace handling to resolve the error
      jsc: {
        transform: {
          react: {
            throwIfNamespace: false,
          },
        },
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  // Add this configuration to handle MIME types correctly
  server: {
    headers: {
      'Content-Type': 'text/html; charset=utf-8', // Default for index.html
    },
    // Ensure modules are served with the correct MIME type
    // This might need adjustment based on the exact server configuration,
    // but Vite generally handles this for module scripts.
    // If issues persist, consider server-side configuration or a specific Vite plugin.
  },
  build: {
    // Ensure correct MIME types for build output
    rollupOptions: {
      output: {
        entryFileNames: `assets/[name]-[hash].js`,
        chunkFileNames: `assets/[name]-[hash].js`,
        assetFileNames: `assets/[name]-[hash].[ext]`
      }
    },
    // Ensure JS modules are served correctly
    modulePreload: {
      polyfill: true
    },
    sourcemap: true // Helpful for debugging production issues
  }
}));