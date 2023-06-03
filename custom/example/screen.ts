import { PanelSpecification } from "@com-pot/infotainment-app/panels"

export const globalArgs = {
  "con.title": "Example 20XX",
  "con.dateStart": "2023-06-06",
  "con.dateEnd": "2023-06-10",
}

const layoutPanel: PanelSpecification = {
  type: 'common.grid-layout',
  config: {
    panels: [
      {
        type: "common.brand",
        style: "grid-area: brand;",
        config: {
          logo: {
            raw: import.meta.glob("./assets/logo.svg", {eager: true, as: "raw"})["./assets/logo.svg"],
          },
        },
        rotationConfig: {
          type: 'follow',
          target: 'schedule-rough',
          filter: [{ type: 'loop' }],
        },
      },
      {
        name: 'schedule-rough',
        type: '@com-pot/schedule.program-schedule-rough',
        config: {
          panelData: {
            eval: "provider",
            name: '@com-pot/schedule.program-schedule-overview',
            args: {
              now: { $get: 'date:now' },
              from: { $get: "global", name: "con.dateStart" },
              to: { $get: "global", name: "con.dateEnd" },
            },
            shareAs: "schedule-groups",
          },

          rotationConfig: {
            type: 'follow',
            target: 'schedule-detail',
            filter: ['done'],

            whenDone: 'loop',
            scroll: {
              sel: { container: '.content', target: '.active' },
            },
          },
        },
      },
      {
        name: 'schedule-detail',
        type: '@com-pot/schedule.program-schedule-detailed',
        config: {
          panelData: {
            eval: "provider",
            name: '@com-pot/schedule.program-schedule',
            args: {
              groups: { eval: "provider", name: "~shared", args: { key: "schedule-groups" } },
              day: { eval: 'state', required: true, path: ['schedule-rough', 'currentDay'], },
            },
          },

          rotationConfig: {
            type: 'interval',
            period: 'PT7S',
            whenDone: 'stop',

            scroll: {
              sel: { container: '.content', target: '.active' },
            },
          },
        },
      },
      {
        type: "common.grid-layout",
        class: "overview-tray",
        style: "grid-area: tray;",
        config: {
          panels: [
            {
              type: "common.clock",
            },
            {
              type: "common.quick-messages",
              config: {
                messages: {
                  eval: "provider", name: "common.quickMessages",
                  args: {
                    now: {$get: "date:now"},
                  },
                },

                rotationConfig: {
                  type: 'interval',
                  period: 'PT5S',

                  scroll: {
                    sel: { container: '.messages', target: '.active' },
                    offset: 0,
                  },
                },
              },
            },
          ],
        },
      },
    ],
  },
  style: `grid-template-areas: "brand brand" "rough detail" "tray tray"; grid-template-rows: auto 1fr auto; grid-template-columns: 2fr 3fr;`,
}

export const rootPanel = layoutPanel
