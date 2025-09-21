import { defineConfig } from 'vite';
import solidJs from 'vite-plugin-solid';  // Correct import: solidJs from 'vite-plugin-solid'

export default defineConfig({
  plugins: [solidJs()],  // Use solidJs() – note the lowercase 's'
  server: {
    port: 3000,
  },
});