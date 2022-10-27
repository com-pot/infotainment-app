import { App } from "vue";
import { ApiOpts } from "../ApiAdapter";
import { ItPanelModule } from "../PanelModule";
import { PanelDataProviderUntyped } from "./dataProviders";
import { createLoader, provideLoader } from "./panelData";
import { createPanelRegistry, providePanelRegistry } from "./panelRegistry";
import * as globalArgs from "./globalArgs"
import { PanelSpecification } from "../panels";

type ItPanelsPluginOpts = {
    modules: ItPanelModule[],

    apiOptions: ApiOpts,

    rootPanelSpec?: () => Promise<PanelSpecification>,

    globalArgs?: Record<string, any>,
}
export default {
    install(app: App, opts: ItPanelsPluginOpts) {
        const panelRegistry = createPanelRegistry(opts.modules)
        providePanelRegistry(app, panelRegistry)

        const providers: Record<string, PanelDataProviderUntyped> = {}
        opts.modules.forEach((module) => {
            Object.entries(module.dataProviders ?? {}).forEach(([name, provider]) => {
                const fqn = `${module.name}.${name}`
                providers[fqn] = provider
            })
        })

        if (opts.rootPanelSpec) {
            app.provide('@com-pot/infotainment-app.rootSpecLoadFn', opts.rootPanelSpec)
        }

        const gArgs = globalArgs.createGlobalArgs(opts.globalArgs || {})
        globalArgs.provideGlobalArgs(app, gArgs)

        const loader = createLoader({
            providers,
            apiOptions: opts.apiOptions,
        })
        provideLoader(app, loader)
    },
}
