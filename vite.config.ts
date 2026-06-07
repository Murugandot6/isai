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
}));