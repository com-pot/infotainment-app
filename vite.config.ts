import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteTsconfigPaths from "vite-tsconfig-paths"

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    viteTsconfigPaths({
      extensions: ['.vue'],
    }),
    vue(),
  ],

  resolve: {
    alias: {
      // For some reason, the vite-tsconfig-paths plugin is not enough
      '@com-pot/infotainment-app': new URL("./src", import.meta.url).pathname,
      '@custom': new URL("./custom", import.meta.url).pathname,
    }
  }
})
