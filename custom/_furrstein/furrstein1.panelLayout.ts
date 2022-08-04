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
          name: 'schedule-rough',
          type: '@com-pot/schedule.program-schedule-rough',
          config: {},
          providerConfig: {
            name: '@com-pot/schedule.program-schedule-overview',
            args: {
              from: '2022-09-08',
              to: '2022-09-11',
            },
          },
          rotationConfig: {
            type: 'follow',
            target: 'schedule-detail',
            whenDone: 'stop',
            
            scroll: {
              sel: { container: '.content', target: '.active'},
            },
          },
        },
        {
          name: 'schedule-detail',
          type: '@com-pot/schedule.program-schedule-detailed',
          rotationConfig: {
            type: 'interval',
            period: 'PT2S',
            whenDone: 'stop',

            scroll: {
              sel: { container: '.content', target: '.active'},
            },
          },
          config: {},
          providerConfig: {
            name: '@com-pot/schedule.program-schedule',
            args: {
              perPage: 5,
            },
          },
        },
        {
          type: '@com-pot/schedule.overview-tray',
          config: {},
          style: "grid-area: tray;"
        },
      ],
    },
    style: `grid-template-areas: "brand brand" "rough detail" "tray tray"; grid-template-rows: auto 1fr auto; grid-template-columns: 2fr 3fr;`,
    // style: `grid-template-rows: auto 1fr auto; grid-template-columns: 3fr 4fr;`,

  }

const withGauges: PanelSpecification = {
    type: 'furrstein.house-points',
    config: {
        contentPanel: rootContent,
    }
}

export default withGauges