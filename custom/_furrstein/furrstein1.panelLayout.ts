import { PanelSpecification } from "@com-pot/infotainment-app/panels"
import logo from "./assets/logo-Furrstein.svg?raw"

const rootContent = {
    type: 'common.grid-layout',
    config: {
      panels: [
        {
          type: "common.brand",
          style: "grid-area: brand;",
          config: {
            logo: {raw: logo},
          },
          rotationConfig: {
            type: 'follow',
            target: 'schedule-rough',
            filter: [{type: 'loop'}],
          },
        },
        {
          name: 'schedule-rough',
          type: '@com-pot/schedule.program-schedule-rough',
          config: {},
          providerConfig: {
            name: '@com-pot/schedule.program-schedule-overview',
            args: {
              now: {$get: 'date:now'},
              from: '2022-09-08',
              to: '2022-09-11',
            },
          },
          rotationConfig: {
            type: 'follow',
            target: 'schedule-detail',
            filter: ['done'],

            whenDone: 'loop',
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
            period: 'PT7S',
            whenDone: 'stop',

            scroll: {
              sel: { container: '.content', target: '.active'},
            },
          },
          config: {},
          providerConfig: {
            name: '@com-pot/schedule.program-schedule',
            args: {
              day: {eval: 'state', required: true, path: ['schedule-rough', 'currentDay'],},
            },
          },
        },
        {
          type: '@com-pot/schedule.overview-tray',
          rotationConfig: {
            type: 'interval',
            period: 'PT5S',

            scroll: {
              sel: { container: '.messages', target: '.active'},
              offset: 0,
            },
          },
          config: {
            messagePollFrequency: 'PT30S',
          },
          style: "grid-area: tray;"
        },
      ],
    },
    style: `grid-template-areas: "brand brand" "rough detail" "tray tray"; grid-template-rows: auto 1fr auto; grid-template-columns: 2fr 3fr;`,
    // style: `grid-template-rows: auto 1fr auto; grid-template-columns: 3fr 4fr;`,

  }

const withGauges: PanelSpecification = {
    type: '@com-pot/con-game.house-points',
    config: {
        contentPanel: rootContent,
        scorePollFrequency: 'PT5S',
    }
}

export default withGauges