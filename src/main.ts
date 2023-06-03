import { createApp } from 'vue'
import App from './App.vue'
import itPanelsVuePlugin from './panels/itPanels.vuePlugin'

import itPanelsDefaultModuleItPanelModule from './panels/itPanelsDefaultModule.itPanelModule'
import scheduleModuleItPanelModule from '@cp-infotainment/schedule/scheduleModule.itPanelModule'
import conGameItPanelModule from '@cp-infotainment/con-game/conGame.itPanelModule'
import i18nPlugin from '@cp-infotainment/i18n/i18n.plugin'

import "./sass/infotainment.scss"
import { importAsObj, mapImporters, selectImporter } from '@typeful/vite-custom/selectiveImport'

createApp(App)
    .use(i18nPlugin, {
        availableLocales: [
            { value: 'cs', icon: "twemoji:flag-czechia" },
            { value: 'en', icon: "twemoji:flag-united-kingdom" },
        ],
    })
    .use(itPanelsVuePlugin, {
        apiOptions: {
            baseUrl: import.meta.env.VITE_APP_API_BASE_URL,
        },
        modules: [
            itPanelsDefaultModuleItPanelModule,
            scheduleModuleItPanelModule,
            conGameItPanelModule,
        ],

        staticPaths: collectStaticDataKeys(),

        screenSpec: (name?: string) => {
            const availableSpecs = mapImporters(import.meta.glob('../custom/**/(*.)?screen.@(js|ts)'), {
                trim: {
                    start: /^\.\.\/custom\//,
                    end: /\.?screen\.(js|ts)$/,
                },
            })
            const app = import.meta.env.VITE_APP_CUSTOM_DATA_KEY
            const screen = name || 'default'
            const key = `${app}/${screen}`

            const importFn = selectImporter(availableSpecs, key)

            return importAsObj(importFn)
        },
    })
    .mount('#app')

function collectStaticDataKeys() {
    const files = Object.keys(import.meta.glob("../custom/*/data/**/*.json"))

    return files
        .filter((path) => path.includes(import.meta.env.VITE_APP_CUSTOM_DATA_KEY))
        .map((path) => {
            const indexOfDataStr = path.indexOf("/data/", "../custom/".length)

            return path.substring(indexOfDataStr + "/data/".length)
        })
}
