import * as tinyduration from "tinyduration"
import { defineRotationEngineFactory} from "./base"

const durationToMs = (d: tinyduration.Duration) => {
    const cMinutes = (d.hours ?? 0 ) * 60 + (d.minutes ?? 0)
    const cSeconds = cMinutes * 60 + (d.seconds ?? 0)
    return cSeconds * 1000
}

export const createIntervalEngine = defineRotationEngineFactory<IntervalConfig>((rotate, config) => {
    const durationObj = tinyduration.parse(config.period)
    const durationMs = durationToMs(durationObj)

    let interval: ReturnType<typeof setInterval>

    return {
        start() {
            interval = setInterval(() => rotate.tick(new Event('tick')), durationMs)
        },
        stop() {
            clearInterval(interval)
        },
    }
})

export type IntervalConfig = {type: 'interval', period: string, whenDone?: 'stop' | 'loop'}