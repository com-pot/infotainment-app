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

        rootSpec: () => {
            const availableSpecs = mapImporters(import.meta.glob('../custom/**/(*.)?rootSpec.@(js|ts)'))

            const importFn = selectImporter(availableSpecs, __ROOT_PANEL_SPEC_MODULE__)
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
