import { PanelSpecification } from "@com-pot/infotainment-app/panels"
import logo from "./assets/title.2.svg"
const rootContent = {
    type: 'common.grid-layout',
    config: {
      panels: [
        {
          type: "common.brand",
          style: "grid-area: brand;",
          config: {
            logo,
          },
        },
        {
          type: '@com-pot/schedule.program-schedule-rough',
          config: {},
        },
        {
          type: '@com-pot/schedule.program-entry-detail',
          config: {},
        },
        {
          type: '@com-pot/schedule.overview-tray',
          config: {},
          style: "grid-area: tray;"
        },
      ],
    },
    style: `grid-template-areas: "brand brand" "rough detail" "tray tray"; grid-template-rows: auto 1fr auto;`,
  }

const withGauges: PanelSpecification = {
    type: 'furrstein.house-points',
    config: {
        contentPanel: rootContent,
    }
}

export default withGauges