import { App, computed, inject, reactive } from "vue"

export type GlobalArgsData = Record<string, any>
type DataSource = {
    name: string,
    data: GlobalArgsData,
}

export const createGlobalArgs = (initData: GlobalArgsData = {}): GlobalArgs => {
    const sources: DataSource[] = reactive([
        {name: 'init', data: initData},
    ])

    const args = computed(() => {
        const args: GlobalArgsData = {}
        sources.forEach((source) => Object.assign(args, source.data))
        return args
    })
    
    return {
        get(name) {
            return args.value[name]
        },
        entries() {
            return Object.entries(args.value)
        },

        addSource(name, data) {
            sources.push({name, data})
            return this
        },
        spliceSource(name) {
            const removed = sources.filter((source) => source.name === name)
            removed.forEach((source) => {
                const i = sources.indexOf(source)
                sources.splice(i, 1)
            })

            return removed
        },
    }
}

export const globalArgsInjectionKey = Symbol('global args')
export const provideGlobalArgs = (app: App, globalArgs: GlobalArgs) => app.provide(globalArgsInjectionKey, globalArgs)
export const useGlobalArgs = () => inject(globalArgsInjectionKey) as GlobalArgs

export type GlobalArgs = {
    get(name: string): any;
    entries(): [string, any][],

    addSource(name: string, data: GlobalArgsData): GlobalArgs,
    spliceSource(name: string): DataSource[],
}
