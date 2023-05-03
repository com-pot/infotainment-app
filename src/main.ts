import { createApp } from 'vue'
import App from './App.vue'
import itPanelsVuePlugin from './panels/itPanels.vuePlugin'

import itPanelsDefaultModuleItPanelModule from './panels/itPanelsDefaultModule.itPanelModule'
import scheduleModuleItPanelModule from '../custom/com-pot/schedule/scheduleModule.itPanelModule'
import conGameItPanelModule from '@custom/com-pot/con-game/conGame.itPanelModule'
import i18nPlugin from '@custom/com-pot/i18n/i18n.plugin'

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

        rootSpec: () => {
            const availableSpecs = mapImporters(import.meta.glob('../custom/**/(*.)?rootSpec.@(js|ts)'))

            const importFn = selectImporter(availableSpecs, __ROOT_PANEL_SPEC_MODULE__)
            return importAsObj(importFn)
        },
    })
    .mount('#app')
