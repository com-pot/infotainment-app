import { createApp } from 'vue'
import App from './App.vue'
import itPanelsVuePlugin from './panels/itPanels.vuePlugin'

import itPanelsDefaultModuleItPanelModule from './panels/itPanelsDefaultModule.itPanelModule'
import scheduleModuleItPanelModule from '../custom/com-pot/schedule/scheduleModule.itPanelModule'
import conGameItPanelModule from '@custom/com-pot/con-game/conGame.itPanelModule'
import i18nPlugin from '@custom/com-pot/i18n/i18n.plugin'

import "./sass/infotainment.scss"

createApp(App)
    .use(i18nPlugin, {
        availableLocales: [
            {value: 'cs', icon: "twemoji:flag-czechia"},
            {value: 'en', icon: "twemoji:flag-united-kingdom"},
        ],
    })
    .use(itPanelsVuePlugin, {
        apiOptions: {
            baseUrl: getBaseUrl(),
        },
        modules: [
            itPanelsDefaultModuleItPanelModule,
            scheduleModuleItPanelModule,
            conGameItPanelModule,
        ],

        rootSpec: () => {
            // TODO: Move this logic to a plugin through vite.config.ts
            const name = __ROOT_PANEL_SPEC_MODULE__

            const specFiles = import.meta.glob('../custom/**/*.rootSpec.@(js|ts)')
            const entries = Object.entries(specFiles)
                .map(([path, loadFn]) => [path.replace('../custom', '@custom'), loadFn])
            const availableSpecs = Object.fromEntries(entries)
            const importFn = availableSpecs[name] || availableSpecs[name + '.js'] || availableSpecs[name + '.ts']

            if (!importFn) {
                return Promise.reject(`App spec '${name}' not found`)
            }

            return importFn()
                .then((module: Record<string, any>) => ({...module}))
        },
    })
    .mount('#app')

function getBaseUrl() {
    const path = import.meta.env.VITE_API_BASE_URL
    if (!path) {
        console.warn("No API base url provided")
        return "/"
    }

    return path
        .replace('BASE_URL', window.location.origin + import.meta.env.BASE_URL)
        .replace('VITE_APP_CUSTOM_DATA_KEY', import.meta.env.VITE_APP_CUSTOM_DATA_KEY)
}
