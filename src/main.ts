import { createApp } from 'vue'
import App from './App.vue'
import itPanelsVuePlugin from './panels/itPanels.vuePlugin'
import timeVuePlugin from './panels/time.vuePlugin'

import itPanelsDefaultModuleItPanelModule from './panels/itPanelsDefaultModule.itPanelModule'
import scheduleModuleItPanelModule from '@cp-infotainment/schedule/scheduleModule.itPanelModule'
import conGameItPanelModule from '@cp-infotainment/con-game/conGame.itPanelModule'
import i18nPlugin from '@cp-infotainment/i18n/i18n.plugin'

import "./sass/infotainment.scss"
import { importAsObj, mapImporters, selectImporter } from '@typeful/vite-custom/selectiveImport'
import { provideRenderer, createRenderer } from '@typeful/data/rendering'
import { localeControllerInjectionKey } from '@cp-infotainment/i18n/localeController'
import { globalArgsInjectionKey } from './panels/globalArgs'

createApp(App)
    .use(i18nPlugin, {
        availableLocales: [
            { value: 'cs', icon: "twemoji:flag-czechia" },
            { value: 'en', icon: "twemoji:flag-united-kingdom" },
        ],
    })
    .use(timeVuePlugin)
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
    .use(function typefulRendererPlugin(app) {
        const globalArgs = app._context.provides[globalArgsInjectionKey]
        const locCtrl = app._context.provides[localeControllerInjectionKey]
        const renderer =  createRenderer({
            defaultLocale: "cs",
            localeOverride: {
                time: "cs", // to use 24h format
                date: "cs", // to avoid MM/DD format
            },
        }, globalArgs, locCtrl)

        provideRenderer(renderer, app)
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
