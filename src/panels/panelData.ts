import { isNil } from "lodash"
import { App, computed, ComputedRef, inject, onBeforeUnmount, PropType, watch } from "vue"
import { ApiAdapter, ApiOpts } from "../ApiAdapter"
import asyncReactive from "../components/asyncReactive"
import { StateHub } from "../components/stateHub"
import { PanelDataProviderUntyped } from "./dataProviders"
import { PollConfig, usePoll } from "./polling"

export type PanelDataLoader = {
    api: ApiAdapter,

    load<TData = any>(providerName: string, args: unknown): Promise<TData>,
    watch<TData = any>(src: () => ProviderConfig|undefined): ReturnType<typeof asyncReactive<TData>>,
}

const injectionSymbol = Symbol('panelDataLoader')
export const useLoader = () => inject(injectionSymbol, () => {
    throw new Error('PanelData loader not provided')
}, true) as PanelDataLoader
export const provideLoader = (vue: App, loader: PanelDataLoader) => vue.provide(injectionSymbol, loader)

export const createLoader = (opts: {
    providers: Record<string, PanelDataProviderUntyped>,
    apiOptions: ApiOpts,
}): PanelDataLoader => {
    const api = new ApiAdapter({
        ...opts.apiOptions,
        requestDefaults:{
            accept: 'json',
        },
    })

    const loader: PanelDataLoader = {
        api,

        async load(name, args) {
            const provider = opts.providers[name]
            if (!provider) {
                return Promise.reject(`No provider with name ${name}`)
            }

            return provider.load.call(this, args)
                .then(async (res) => {
                    await new Promise((res) => setTimeout(res, 250 + Math.random() * 750))
                    return res
                })
        },

        watch(src) {
            const data = asyncReactive<any>()
            let poll: ReturnType<typeof usePoll> | null = null
            watch(src, (config) => {
                if (poll !== null) {
                    poll.stop()
                    poll = null
                }
                if (!config) {
                    return data._clear()
                }

                data._await(this.load(config.name, config.args))

                if (config.poll) {
                    poll = usePoll(config.poll, async () => {
                        const value = await this.load(config.name, config.args)
                        data._set(value)
                    })
                    poll.start()
                }
            }, {immediate: true})

            onBeforeUnmount(() => {
                poll && poll.stop()
            })

            return data
        },
    }

    return loader
}

const $nada = Symbol('nada')
const prepareArgument = (arg: any, stateHub?: StateHub) => {
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
    if (arg.val) {
        return arg.val
    }

    console.warn("Unknown argument spec, using as value. If this is intentional, wrap your value in {val: your_object}", arg);
    return arg
}
const prepareProviderConfig = (config?: ProviderConfig, stateHub?: StateHub): ProviderConfig | undefined => {
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

export const useDependentConfig = (getConfig: () => ProviderConfig|undefined, stateHub?: StateHub): ComputedRef<ProviderConfig|undefined> => {
    return computed(() => prepareProviderConfig(getConfig(), stateHub))
}

type ProviderConfig = {name: string, args: any, poll?: PollConfig}
export const providerConfigProp = {
    type: Object as PropType<ProviderConfig>, required: true
}
