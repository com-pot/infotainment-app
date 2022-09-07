import { defineItPanelModule } from "@com-pot/infotainment-app/PanelModule"
import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders"
import { GameHouse, HouseScore } from "./model"
import { assignScores, createStandings } from "./houseStandings"
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
        'house-standings': defineDataProvider({
            async load(args) {
                const houses = await this.load('@com-pot/con-game.houses', args) as GameHouse[]
                const scores = await this.load('@com-pot/con-game.scores', args) as HouseScore[]

                const standings = createStandings(houses)
                assignScores(standings, scores)

                return standings
            },
        }),
    }
})