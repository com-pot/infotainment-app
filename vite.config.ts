import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteTsconfigPaths from "vite-tsconfig-paths"
import {viteStaticCopy as copy} from "vite-plugin-static-copy" 

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    copy({
      targets: [
        {
          src: './custom/_furrstein/data/**/*', dest: 'api',
        },
      ],
      flatten: false,
    }),
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
      "@typeful/data": new URL("./libs/typeful-data/src", import.meta.url).pathname,

      '@com-pot/schedule': new URL("./libs/com-pot/schedule/src", import.meta.url).pathname,
    },
  }
})
