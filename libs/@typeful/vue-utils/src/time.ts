import * as tinyduration from "tinyduration"

export const durationToMs = (d: string | tinyduration.Duration) => {
    if (typeof d === 'string') {
        d = tinyduration.parse(d)
    }

    const cMinutes = (d.hours ?? 0 ) * 60 + (d.minutes ?? 0)
    const cSeconds = cMinutes * 60 + (d.seconds ?? 0)
    return cSeconds * 1000
}

export function breakUpDelay(c: number, d: number) {
    const r = Math.random() * 2 - 1
    return c + Math.round(d * r)
}

export const resolveAfter = (t: number) => new Promise((res) => setTimeout(res, t));
export const resolveWith = <T=any>(arg: T, t: number = 0): Promise<T> => {
  if (t <= 0) {
    return Promise.resolve(arg)
  }
  return resolveAfter(t).then(() => arg)
}

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

