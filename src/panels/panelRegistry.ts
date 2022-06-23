import { App, inject, defineComponent } from "vue"
import { ItPanelModule } from "../PanelModule"

export type PanelEntrySpec = {
    name: string,
    component: ReturnType<typeof defineComponent>,
}
export type PanelEntry = PanelEntrySpec & {
    fullName: string,
}
export type PanelRegistry = Record<string, PanelEntry>

export function createPanelRegistry(panelModules: ItPanelModule[]):  PanelRegistry {
    const registry: PanelRegistry = {}

    panelModules.forEach((module) => {
        module.panels.forEach((panel) => {
            const fqn = `${module.name}.${panel.name}`

            registry[fqn] = {
                name: panel.name,
                fullName: fqn,
                component: panel.component,
            }
        })
    })

    return registry
}
export const providePanelRegistry = (app: App, panelRegistry: PanelRegistry) => app.provide('com-pot/infotainment.panelRegistry', panelRegistry)
export const usePanelRegistry = (): PanelRegistry => inject<PanelRegistry>('com-pot/infotainment.panelRegistry', (): PanelRegistry => {throw new Error("PanelRegistry not available")}, true)

