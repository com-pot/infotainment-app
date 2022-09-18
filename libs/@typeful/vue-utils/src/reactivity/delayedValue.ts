import { ref, watch } from "vue"

type DelayedValueOpts<T> = {
    delay: number,
    filter?: (value: T) => boolean|number,
}
export default function delayedValue<T>(cb: () => T, opts: DelayedValueOpts<T>) {
    const value = ref<T>(cb())
    watch(cb, (val) => {
        let delay = opts.filter?.(val) ?? opts.delay
        if (delay === false) {
            value.value = val as any
            return
        }
        setTimeout(() => value.value = val as any, typeof delay === 'number' ? delay : opts.delay)
    })

    return value
}
