import { App } from "vue";
import { isNil } from "lodash";
import { ApiAdapter, ApiOpts, RequestMiddleware } from "../ApiAdapter";
import { ItPanelModule } from "../PanelModule";
import { PanelDataProviderUntyped } from "./dataProviders";
import { createLoader, provideLoader } from "./panelData";
import { createPanelRegistry, providePanelRegistry } from "./panelRegistry";
import { createGlobalArgs, provideGlobalArgs } from "./globalArgs"
import { createSubstitutions, SubstitutionsFactories } from "@typeful/data/substitutions";
import { ScreenSpec, provideScreenSpec } from "../panels";

type ItPanelsPluginOpts = {
    modules: ItPanelModule[],

    apiOptions: ApiOpts,
    staticPaths?: string[],

    screenSpec: () => Promise<ScreenSpec>,
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

        const globalArgs = createGlobalArgs({})
        provideGlobalArgs(app, globalArgs)

        opts.screenSpec && provideScreenSpec(app, opts.screenSpec)

        const substitutionFactories: SubstitutionsFactories<any> = {
            "date:now": () => new Date(),
            "global": (args: {name: string}) => {
                if (!args.name) {
                    console.warn("substitution global got invalid args", args);
                    return null
                }
                const value = globalArgs.get(args.name)
                if (isNil(value)) {
                    console.warn(`globalArgs has no value for '${args.name}'`)
                    return null
                }

                return value
            },
        }

        const api = new ApiAdapter({
            baseUrl: createBaseUrl(opts.apiOptions.baseUrl || ""),
            requestDefaults: {
                accept: 'json',
            },

            middlewareRequest: [
                createStaticDataUrlReplaceMiddleware(opts.staticPaths || []),
            ],
        })

        const loader = createLoader(api, {
            providers,
            substitutions: createSubstitutions(substitutionFactories),
        })

        provideLoader(app, loader)
    },
}

function createStaticDataUrlReplaceMiddleware(staticPaths: string[]): RequestMiddleware {
    const pathEntries = staticPaths.map((path) => ({
        path,
        pathNoExt: path.substring(0, path.length - ".json".length),
    }))

    const staticBase = createBaseUrl(import.meta.env.VITE_APP_API_STATIC_URL || "")
    if (!staticBase) {
        if (pathEntries.length) {
            console.warn("Static entries found but no VITE_APP_API_STATIC_URL available");
        }
        return (config) => config
    }

    return (config) => {
        const staticPath = pathEntries.find((path) => config.url.includes(path.pathNoExt))
        if (!staticPath) return

        return {...config, url: staticBase + staticPath.path}
    }
}


function createBaseUrl(baseUrl: string) {
    if (baseUrl.startsWith('//')) {
        return window.location.origin + '/' + baseUrl.substring(2)
    }
    return baseUrl
}
