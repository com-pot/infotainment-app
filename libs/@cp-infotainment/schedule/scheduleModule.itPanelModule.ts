import { defineItPanelModule } from "@com-pot/infotainment-app/PanelModule"

import ProgramScheduleRough from "./it-panels/ProgramScheduleRough.vue"
import ProgramScheduleDetailed from "./it-panels/ProgramScheduleDetailed.vue"
import programScheduleOverview from "./dataProviders/program-schedule-overview"
import programSchedule from "./dataProviders/program-schedule"
import programScheduleOverviewBackstage from "./dataProviders/program-schedule-overview.backstage"
import programScheduleOverviewIcal from "./dataProviders/program-schedule-overview.ical"

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
        'program-schedule-overview.backstage': programScheduleOverviewBackstage,
        'program-schedule-overview.ical': programScheduleOverviewIcal,
        'program-schedule': programSchedule,
    },
})
