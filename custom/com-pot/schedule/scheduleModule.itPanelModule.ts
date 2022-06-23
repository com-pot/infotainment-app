import { defineItPanelModule } from '../../../src/panels/panelRegistry'

import ProgramScheduleRough from "./it-panels/ProgramScheduleRough.vue"
import ProgramEntryDetail from "./it-panels/ProgramEntryDetail.vue"
import OverviewTray from "./it-panels/OverviewTray.vue"

export default defineItPanelModule({
    name: '@com-pot/schedule',
    panels: [
        {
            name: 'program-schedule-rough',
            component: ProgramScheduleRough,
        },
        {
            name: 'program-entry-detail',
            component: ProgramEntryDetail,
        },
        {
            name: 'overview-tray',
            component: OverviewTray,
        },
    ],
})
