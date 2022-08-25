import { App, inject } from "vue"

export type GlobalArgsData = Record<string, any>

export const createGlobalArgs = (data?: GlobalArgsData): GlobalArgs => {
    const globalArgs = {
        data: data || {},
    }

    return {
        get(name) {
            return globalArgs.data[name]
        },
    }
}

export const globalArgsInjectionKey = Symbol('global args')
export const provideGlobalArgs = (app: App, globalArgs: GlobalArgs) => app.provide(globalArgsInjectionKey, globalArgs)
export const useGlobalArgs = () => inject(globalArgsInjectionKey) as GlobalArgs

export type GlobalArgs = {
    get(name: string): any;
}