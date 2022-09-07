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
