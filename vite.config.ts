import { defineConfig } from 'vite'
import solidPlugin from 'vite-plugin-solid'
import tsconfigPaths from 'vite-tsconfig-paths';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    solidPlugin(), 
    tsconfigPaths()
  ],
  server: {
    port: 3000,
  },
  build: {
    target: 'esnext',
  },
});
