import { ComputedRef, watch } from "vue"
import { AsyncRef } from "../reactivity"
import { isNil } from "lodash"

export function getMissingParams(component: any, hydratedParams?: [string, AsyncRef|null][]) {
    return Object.entries((component.props || {}) as Record<string, any>)
        .filter(([name, prop]) => {
            if (!prop.required) {
                return false
            }
            const paramValueEntry = hydratedParams?.find(([hydratedName, param]) => name === hydratedName && !isNil(param))
            return !paramValueEntry
        })
}

export function watchPolling(ref: ComputedRef<[string, any][]>) {
    watch(ref, (params, prevParams) => {
        prevParams?.forEach(([name, param]) => {
            if (typeof param?.poll?.stop === 'function') {
                param.poll.stop()
            }
        })

        params?.forEach(([name, param]) => {
            if (typeof param?.poll?.start === 'function') {
                param.poll.start()
            }
        })
    }, {immediate: true})
}
