import { App } from "vue";
import { createPanelRegistry, ItPanelModule, providePanelRegistry } from "./panelRegistry";

type ItPanelsPluginOpts = {
    modules: ItPanelModule[],
}
export default {
    install(app: App, opts: ItPanelsPluginOpts) {
        const panelRegistry = createPanelRegistry(opts.modules)
        providePanelRegistry(app, panelRegistry)
    },
}