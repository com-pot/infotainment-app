import { breakUpDelay, durationToMs } from "../utils/timeUtils"

export type PollConfig = string

export function usePoll(pollConfig: PollConfig, cb: () => any | Promise<any>) {
    let timeout: ReturnType<typeof setTimeout> | null = null
    const pollDelay = durationToMs(pollConfig)

    async function tick() {
        await cb()
        timeout = setTimeout(tick, breakUpDelay(pollDelay, 100))
    }

    return {
        start() {
            if (timeout) {
                return
            }

            timeout = setTimeout(tick, pollDelay)
        },
        stop() {
            if (timeout) {
                clearTimeout(timeout)
            }
        }
    }
}

