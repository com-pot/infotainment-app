import { defineItPanelModule } from "@com-pot/infotainment-app/PanelModule"

import ProgramScheduleRough from "./it-panels/ProgramScheduleRough.vue"
import ProgramEntryDetail from "./it-panels/ProgramEntryDetail.vue"
import OverviewTray from "./it-panels/OverviewTray.vue"
import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders"

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

    dataProviders: {
        'program-schedule': defineDataProvider.withSchema({
            argsSchema: {
                type: 'object',
                properties: {
                    page: {type: 'number'},
                    perPage: {type: 'number', default: 10},
                },
                required: ['page'],
            } as const,
        
            async load(args) {
                const perPage = args.perPage ?? 10

                const items = []
                const adjs = ['Heinous', 'Frivolous', 'Wealthy', 'Ground-shattering', 'Fruitless', 'Gruesome', 'Humble', 'Throne']
                const nouns = ['Act', 'Feast', 'Cavern', 'Roar', 'Flipper', 'Sig', 'Dungeon', 'Seaside']
                const spots = ['Spot', 'Dungeon', 'Room', 'Forest']

                for (let i = 0; i < perPage; i++) {
                    const adj = adjs[Math.floor(Math.random() * adjs.length)]
                    const noun = nouns[Math.floor(Math.random() * nouns.length)]

                    const locAdj = adjs[Math.floor(Math.random() * adjs.length)]
                    const spot = spots[Math.floor(Math.random() * spots.length)]

                    items.push({
                        title: `${adj} ${noun}`,
                        location: `The ${locAdj} ${spot}`,
                        description: 'Lorem ipsum dolor sit amet consectetur adipisicing elit. Doloribus eveniet tempore illum assumenda provident illo amet quibusdam quos beatae! Quo magnam accusamus et ea iure! Magnam delectus non ad ducimus!',
                    })
                }

                return items
            },
        })
    },    
})
