import { defineItPanelModule } from "../PanelModule";
import GridLayoutPanel from "../it-panels/GridLayoutPanel.vue";
import BrandPanel from "../it-panels/BrandPanel.vue";
import quickMessages from "../dataProviders/quickMessages";

export default defineItPanelModule({
    name: 'common',
    panels: [
        {
            name: 'grid-layout',
            component: GridLayoutPanel,
        },

        {
            name: 'brand',
            component: BrandPanel,
        },
    ],
    dataProviders: {
        quickMessages: quickMessages,
    },
})
