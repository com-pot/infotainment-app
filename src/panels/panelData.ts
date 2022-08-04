import { App, inject, PropType, provide, watch } from "vue"
import { ApiAdapter, ApiOpts } from "../ApiAdapter"
import asyncReactive from "../components/asyncReactive"
import { PanelDataProviderUntyped } from "./dataProviders"

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
            watch(src, (config) => {                
                if (!config) {
                    return data._clear()
                }
                data._await(this.load(config.name, config.args))
            }, {immediate: true})
            return data
        },
    }

    return loader
}

type ProviderConfig = {name: string, args: any}
export const providerConfigProp = {
    type: Object as PropType<ProviderConfig>, required: true
}
