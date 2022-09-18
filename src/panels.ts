import { App, inject } from "vue"
import { asyncReactive } from "@typeful/vue-utils/reactivity"

export type PanelSpecification<TConfig extends object = any> = {
    name?: string,
    type: string,
    config: TConfig,

    class?: string,
    style?: Record<string, unknown>|string,
}

export type PanelAppRootSpec = {
    rootPanel: PanelSpecification,

    globalArgs?: Record<string, any>,
}

export function providePanelAppRootSpec(app: App, spec: () => Promise<PanelAppRootSpec>) {
    app.provide('@com-pot/infotainment-app.rootSpecLoadFn', spec)
}
export function usePanelAppRootSpec() {
    let loaderFn = inject('@com-pot/infotainment-app.rootSpecLoadFn') as () => Promise<PanelAppRootSpec>
    if (!loaderFn) {
        loaderFn = () => Promise.reject(new Error('rootSpecLoadFn not provided'))
    }

    return asyncReactive(loaderFn())
}
