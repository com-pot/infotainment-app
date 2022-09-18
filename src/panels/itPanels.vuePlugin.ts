import { App } from "vue";
import { ApiOpts } from "../ApiAdapter";
import { ItPanelModule } from "../PanelModule";
import { PanelDataProviderUntyped } from "./dataProviders";
import { createLoader, provideLoader } from "./panelData";
import { createPanelRegistry, providePanelRegistry } from "./panelRegistry";
import {createGlobalArgs, provideGlobalArgs, type GlobalArgsData} from "./globalArgs"
import { createSubstitutions, SubstitutionsFactories } from "@typeful/data/substitutions";
import { PanelAppRootSpec, providePanelAppRootSpec } from "../panels";

type ItPanelsPluginOpts = {
    modules: ItPanelModule[],

    apiOptions: ApiOpts,

    globalArgs?: GlobalArgsData,

    rootSpec?: () => Promise<PanelAppRootSpec>,
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

        provideGlobalArgs(app, createGlobalArgs(opts.globalArgs))

        opts.rootSpec && providePanelAppRootSpec(app, opts.rootSpec)

        const substitutionFactories: SubstitutionsFactories = {}
        const debugNow = import.meta.env.VITE_DEBUG_TIME_TRAVEL_NOW as string
        if (debugNow) {
            console.warn("Using time travel debug to", debugNow);
            substitutionFactories['date:now'] = () => new Date(debugNow)
        } else {
            substitutionFactories['date:now'] = () => new Date()
        }

        const loader = createLoader({
            providers,
            apiOptions: opts.apiOptions,
            substitutions: createSubstitutions(substitutionFactories),
        })

        provideLoader(app, loader)
    },
}
