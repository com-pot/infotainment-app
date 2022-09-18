import { defineItPanelModule } from "@com-pot/infotainment-app/PanelModule"
import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders"
import HousePoints from "./it-panels/HousePoints.vue"

export default defineItPanelModule({
    name: '@com-pot/con-game',
    panels: [
        {
            name: "house-points",
            component: HousePoints,
        },
    ],
    dataProviders: {
        'houses': defineDataProvider({
            load() {
                return this.api.req('GET', 'com-pot/con-game/houses.json')
            },
        }),
        'scores': defineDataProvider({
            load() {
                return this.api.req('GET', 'com-pot/con-game/scores.json')
            },
        }),
    }
})
