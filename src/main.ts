import { createApp } from 'vue'
import App from './App.vue'
import itPanelsVuePlugin from './panels/itPanels.vuePlugin'

import itPanelsDefaultModuleItPanelModule from './panels/itPanelsDefaultModule.itPanelModule'
import scheduleModuleItPanelModule from '../custom/com-pot/schedule/scheduleModule.itPanelModule'

import "./sass/infotainment.scss"
import "../custom/_furrstein/furrsteinTheme.scss"
import furrsteinItPanelModule from 'custom/_furrstein/furrstein.itPanelModule'
import conGameVuePlugin from '@custom/com-pot/con-game/conGame.vuePlugin'
import i18nPlugin from '@custom/com-pot/i18n/i18n.plugin'

createApp(App)
    .use(i18nPlugin, {
        availableLocales: ['cs', 'en'],
    })
    .use(conGameVuePlugin)
    .use(itPanelsVuePlugin, {
        modules: [
            itPanelsDefaultModuleItPanelModule,
            scheduleModuleItPanelModule,
            furrsteinItPanelModule,
        ],
    })
    .mount('#app')
