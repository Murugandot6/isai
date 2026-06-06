import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";

export default defineConfig(() => ({
  plugins: [
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
}));