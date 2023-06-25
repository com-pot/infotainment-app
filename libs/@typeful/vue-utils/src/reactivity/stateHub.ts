import { get, set } from "lodash"
import { inject, provide, reactive, watch } from "vue"

const stateHubInjectionKey = Symbol('state hub')
export function createHub(): StateHub {
    const hub: StateHub = reactive({
        data: {},

        get(path) {
            return get(hub.data, path)
        },
        set(path, value) {
            set(hub.data, path, value)
        },
        watch(path, onChange) {
            return watch(() => hub.get(path), onChange)
        },
    })

    provide(stateHubInjectionKey, hub)

    return hub
}

export const useStateHub = () => inject(stateHubInjectionKey, () => undefined, true) as StateHub | undefined

export type StateHub = {
    data: Record<string, any>;

    get(path: string[]): any;
    set(path: string[], value: any): void;
    watch(path: string[], onChange: (value: any) => void): void;
}

export const stateHubUi = {
    emits: {
        'update:panelState': (path: string[], value: any) => true,
    },
}
