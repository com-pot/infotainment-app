import { ComputedRef, watch } from "vue"
import { AsyncRef } from "../reactivity"

export function getMissingParams(component: any, hydratedParams?: [string, AsyncRef|null][]) {
    const requiredPropsEntries = Object.entries((component.props || {}) as Record<string, any>)
        .filter(([name, prop]) => prop.required)

        const hydrated = Object.fromEntries(hydratedParams || [])

        const unprovidedPropsEntries = requiredPropsEntries
            .filter(([name]) => {
                if (!(name in hydrated)) return true

                const value = hydrated[name]
                return !value && value !== 0
            })

    // unprovidedPropsEntries.length && console.log({
    //     required: Object.fromEntries(requiredPropsEntries),
    //     unprovided: Object.fromEntries(unprovidedPropsEntries),
    //     hydrated: Object.fromEntries(hydratedParams || []),
    // })

    return unprovidedPropsEntries
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
