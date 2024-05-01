import { isNil } from "lodash"
import { App, inject, onBeforeUnmount, watch } from "vue"
import { asyncReactive } from "@typeful/vue-utils/reactivity"
import { StateHub } from "@typeful/vue-utils/reactivity/stateHub";
import { Substitutions } from "@typeful/data/substitutions"

import { ApiAdapter } from "../ApiAdapter"
import { defineDataProvider, PanelDataProviderUntyped } from "./dataProviders"
import { PollConfig, usePoll } from "@typeful/vue-utils/time"

export type PanelDataLoader = {
    api: ApiAdapter,

    load<TData = any>(config: ProviderConfig): Promise<TData>,
    initialize<TData = any>(config: ProviderConfig): ReturnType<typeof asyncReactive<TData>>,
    watch<TData = any>(src: () => ProviderConfig|undefined): ReturnType<typeof asyncReactive<TData>>,
}

const injectionSymbol = Symbol('panelDataLoader')
export const useLoader = () => inject(injectionSymbol, () => {
    throw new Error('PanelData loader not provided')
}, true) as PanelDataLoader
export const provideLoader = (vue: App, loader: PanelDataLoader) => vue.provide(injectionSymbol, loader)

type LoaderOpts = {
    providers: Record<string, PanelDataProviderUntyped>,

    substitutions: Substitutions,
}
export const createLoader = (api: ApiAdapter, opts: LoaderOpts): PanelDataLoader => {
    const sharedData: Record<string, any> = {}
    const providers: LoaderOpts['providers'] = {
        ...opts.providers,
        '~shared': defineDataProvider({
            async load(args) {
                if (args.key in sharedData) {
                    return sharedData[args.key]
                }
                return Promise.reject(`Key ${args.key} is not shared`)
            },
        }),
    }

    const loader: PanelDataLoader = {
        api,

        async load(loaderConfig) {
            const provider = providers[loaderConfig.name]
            if (!provider) {
                return Promise.reject(new Error(`No provider with name ${loaderConfig.name}`))
            }

            const loadPromise = provider.load.call(this, await opts.substitutions.replaceMultiple(loaderConfig.args, 'async'))
            if (loaderConfig.shareAs) {
                sharedData[loaderConfig.shareAs] = loadPromise
            }

            return loadPromise
        },

        initialize(config) {
            const data = asyncReactive<any>()
            data._await(this.load(config))

            if (config.poll) {
                data.poll = usePoll(config.poll, async () => {
                    const value = await this.load(config)
                    data._set(value)
                })
            }

            return data
        },

        watch(src) {
            const data = asyncReactive<any>()

            watch(src, (config) => {
                if (data.poll !== null) {
                    data.poll.stop()
                    data.poll = null
                }

                if (!config) {
                    return data._clear()
                }

                data._await(this.load(config))

                if (config.poll) {
                    data.poll = usePoll(config.poll, async () => {
                        const value = await this.load(config)
                        data._set(value)
                    })
                    data.poll.start()
                }
            }, {immediate: true})

            onBeforeUnmount(() => {
                data.poll?.stop()
                data.poll = null
            })

            return data
        },
    }

    return loader
}

const $nada = undefined
export const prepareArgument = (arg: any, stateHub?: StateHub) => {
    if (!arg || typeof arg !== 'object') {
        return arg
    }

    if (arg.eval === 'state') {
        if (!stateHub) {
            return $nada
        }
        const value = stateHub.get(arg.path)
        if (isNil(value) && arg.required) {
            return $nada
        }
        return value
    }
    if (arg.eval === 'provider') {
        return arg
    }
    if (arg.val) {
        return arg.val
    }
    if (arg.$get) {
        return arg
    }

    console.warn("Unknown argument spec, using as value. If this is intentional, wrap your value in {val: your_object}", arg);
    return arg
}
export const prepareProviderConfig = (config: ProviderConfig, stateHub?: StateHub): ProviderConfig | undefined => {
    if (!config || !config.args || typeof config.args !== 'object') {
        return config
    }

    const entries = Object.entries(config.args)
    for (let entry of entries) {
        const value = prepareArgument(entry[1], stateHub)
        if (value === $nada) {
            return undefined
        }
        entry[1] = value
    }
    const result = {
        ...config,
        args: Object.fromEntries(entries),
    }

    return result
}

type ProviderConfig = {
    name: string, args: any,
    poll?: PollConfig,
    shareAs?: string,
}
