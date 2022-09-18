import { defineConfig, loadEnv, PluginOption } from 'vite'
import vue from '@vitejs/plugin-vue'
import viteTsconfigPaths from "vite-tsconfig-paths"
import {viteStaticCopy as copy} from "vite-plugin-static-copy"

// https://vitejs.dev/config/
export default defineConfig(({mode}) => {
  const env = loadEnv(mode, process.cwd(), '')

  const rootPanelSpecModule = `@custom/${env.VITE_APP_CUSTOM_DATA_KEY}/${env.VITE_APP_CUSTOM_PANEL_FILE || 'rootSpec'}`

  return {
    plugins: [
      copy({
        targets: [
          {
            src: `./custom/${env.VITE_APP_CUSTOM_DATA_KEY}/data/**/*`, dest: 'api',
          },
        ],
        flatten: false,
      }),
      viteTsconfigPaths({
        extensions: ['.vue'],
        loose: true,
      }),
      vue(),
      externalCSSPlugin(`/custom/${env.VITE_APP_CUSTOM_DATA_KEY}/theme.scss`),
    ],

    define: {
      __ROOT_PANEL_SPEC_MODULE__: `"${rootPanelSpecModule}"`,
    },
  }
})

/** Thanks {@link https://stackoverflow.com/questions/72175008/vite-add-css-file-to-end-of-head-section} :) */
function externalCSSPlugin(href: string): PluginOption {
  return {
    name: 'external-css',
    transformIndexHtml: {
      enforce: 'pre',
      transform(html, ctx) {
        return [{
          tag: "link",
          attrs: {rel: "stylesheet", type:"text/css", "href": href},
          injectTo: ctx.server ? "body-prepend" : "head",
        }]
      }
    }
  }
}
