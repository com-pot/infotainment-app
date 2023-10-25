import { reactive, onBeforeMount, onBeforeUnmount, inject, provide, App, getCurrentInstance } from "vue"

export function createTime() {
    const _date = new Date()

    const time = reactive({
        timestamp: _date.getTime(),
        get date(): Date {
            _date.setTime(time.timestamp)
            return _date
        },
    })

    return time
}

export type TimeRef = ReturnType<typeof createTime>

export function provideTime(time: TimeRef, app?: App) {
    app ? app.provide('app.time', time) : provide('app.time', time)
}
export default function useTime(): TimeRef {
    const time = inject('app.time', null) as TimeRef | null
    if (time) return time

    return createTime()
}

export function calibratedTicker(cb: () => any, tDiff: number) {
    let timer: ReturnType<typeof setTimeout>

    function tick(tExpected: number) {
        cb()

        const tNow = Date.now()
        const tDiffError = tNow - tExpected
        const tDiffNext = tDiff - tDiffError
        timer = setTimeout(tick, tDiffNext, tNow + tDiffNext)
    }

    return {
        tick,
        destroy: () => clearTimeout(timer),
    }
}

export function syncTimeWithSystem(time: TimeRef) {
    const ticker = calibratedTicker(() => time.timestamp = Date.now(), 1000)

    if (getCurrentInstance()) {
        onBeforeMount(() => {
            ticker.tick(Date.now())
        })
        onBeforeUnmount(() => {
            ticker.destroy() 
        })
    } else {
        // If we're outside of component, run permanently
        ticker.tick(Date.now())
    }
}
