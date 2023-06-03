import { App, inject, unref } from "vue"
import { MaybeRef } from "@vueuse/core"
import { asyncReactive } from "@typeful/vue-utils/reactivity"

export type PanelSpecification<TConfig extends object = any> = {
    name?: string,
    type: string,
    config: TConfig,

    class?: string,
    style?: Record<string, unknown>|string,
}

export type ScreenSpec = {
    rootPanel: PanelSpecification,

    globalArgs?: Record<string, any>,
}
export type ScreenSpecLoader = (name?: string) => Promise<ScreenSpec>

export function provideScreenSpec(app: App, spec: ScreenSpecLoader) {
    app.provide('@com-pot/infotainment-app.screenSpecLoadFn', spec)
}
export function useScreenSpec(name?: MaybeRef<string | undefined>) {
    let loaderFn = inject('@com-pot/infotainment-app.screenSpecLoadFn') as ScreenSpecLoader
    if (!loaderFn) {
        loaderFn = () => Promise.reject(new Error('screenSpecLoadFn not provided'))
    }
    const nameVal = unref(name)

    return asyncReactive(loaderFn(nameVal))
}
