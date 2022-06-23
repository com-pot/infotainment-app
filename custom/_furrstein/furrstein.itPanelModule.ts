import { defineItPanelModule } from "@com-pot/infotainment-app/PanelModule"
import HousePoints from "./it-panels/HousePoints.vue"

export default defineItPanelModule({
    name: 'furrstein',
    panels: [
        {
            name: "house-points",
            component: HousePoints,
        },
    ],
})