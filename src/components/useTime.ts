import { reactive, onBeforeMount, onBeforeUnmount } from "vue"

type UseTimeOptions = {
    syncWithSystemTime?: true,
}
export default function useTime(options?: UseTimeOptions) {
    const date = new Date()

    const time = reactive({
        timestamp: date.getTime(),

        format(formatOptions: Intl.DateTimeFormatOptions) {
            date.setTime(time.timestamp)
            return date.toLocaleString(['cs'], formatOptions)
        },
    })

    if (options?.syncWithSystemTime) {
        vueLifecycleTicker(() => time.timestamp = Date.now(), 1000)
    }

    return time
}

export function vueLifecycleTicker(cb: () => any, tDiff: number) {
    let timer: ReturnType<typeof setTimeout>

    function tick(tExpected: number) {
        cb()

        const tNow = Date.now()
        const tDiffError = tNow - tExpected
        const tDiffNext = tDiff - tDiffError
        timer = setTimeout(tick, tDiffNext, tNow + tDiffNext)
    }

    onBeforeMount(() => {
        tick(Date.now())
    })
    onBeforeUnmount(() => {
        clearTimeout(timer)
    })
}