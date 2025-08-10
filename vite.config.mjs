import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dyadComponentTagger from '@dyad-sh/react-vite-component-tagger';

// https://vitejs.dev/config/
export default defineConfig({
  base: '/', // Changed from '/isai/' to '/' for custom domain
  plugins: [dyadComponentTagger(), react()],
});