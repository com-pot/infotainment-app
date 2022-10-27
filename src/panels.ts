import { inject } from "vue"
import asyncReactive from "./components/asyncReactive"

export type PanelSpecification<TConfig extends object = any> = {
    name?: string,
    type: string,
    config: TConfig,

    class?: string,
    style?: Record<string, unknown>|string,
}

export function useRootPanelSpecification() {
    const loaderFn = inject('@com-pot/infotainment-app.rootSpecLoadFn') as () => Promise<PanelSpecification>

    return asyncReactive(loaderFn())
}
