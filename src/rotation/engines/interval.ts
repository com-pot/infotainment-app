import { durationToMs } from "@com-pot/infotainment-app/utils/timeUtils"
import { defineRotationEngineFactory} from "./base"


export const createIntervalEngine = defineRotationEngineFactory<IntervalConfig>((rotate, config) => {
    const durationMs = durationToMs(config.period)

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