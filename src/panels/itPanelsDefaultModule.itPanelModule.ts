import { defineItPanelModule } from "../PanelModule";
import GridLayoutPanel from "../it-panels/GridLayoutPanel.vue";
import BrandPanel from "../it-panels/BrandPanel.vue";
import ClockPanel from "../it-panels/ClockPanel.vue";
import QuickMessagesPanel from "../it-panels/QuickMessagesPanel.vue";

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
        {
            name: 'clock',
            component: ClockPanel
        },
        {
            name: 'quick-messages',
            component: QuickMessagesPanel,
        },
    ],
    dataProviders: {
        quickMessages: quickMessages,
    },
})
