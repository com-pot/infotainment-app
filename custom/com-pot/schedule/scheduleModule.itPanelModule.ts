import { defineItPanelModule } from "@com-pot/infotainment-app/PanelModule"

import ProgramScheduleRough from "./it-panels/ProgramScheduleRough.vue"
import ProgramScheduleDetailed from "./it-panels/ProgramScheduleDetailed.vue"
import programScheduleOverview from "./dataProviders/program-schedule-overview"
import programSchedule from "./dataProviders/program-schedule"

export default defineItPanelModule({
    name: '@com-pot/schedule',
    panels: [
        {
            name: 'program-schedule-rough',
            component: ProgramScheduleRough,
        },
        {
            name: 'program-schedule-detailed',
            component: ProgramScheduleDetailed,
        },
    ],

    dataProviders: {
        'program-schedule-overview': programScheduleOverview,
        'program-schedule': programSchedule,
    },
})
