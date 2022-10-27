import { createApp } from 'vue'
import App from './App.vue'
import itPanelsVuePlugin from './panels/itPanels.vuePlugin'

import itPanelsDefaultModuleItPanelModule from './panels/itPanelsDefaultModule.itPanelModule'
import scheduleModuleItPanelModule from '../custom/com-pot/schedule/scheduleModule.itPanelModule'

import "./sass/infotainment.scss"
import "../custom/_fhp/fhp.theme.scss"
import i18nPlugin from '@custom/com-pot/i18n/i18n.plugin'

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
        ],

        globalArgs: {
            'con.title': "Fursuit Halloween 2022",
        },
        rootPanelSpec: () => import("@custom/_fhp/fhp2022.panelLayout").then((mod) => mod.default)
    })
    .mount('#app')

function getBaseUrl() {
    const path = import.meta.env.VITE_API_BASE_URL
    console.log(path);
    
    if (!path) {
        console.warn("No API base url provided")
        return "/"
    }

    return path.replace('BASE_URL', window.location.origin + import.meta.env.BASE_URL)
}
