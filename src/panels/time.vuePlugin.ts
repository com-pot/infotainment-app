import { App } from "vue"
import createTime, { TimeRef, provideTime, syncTimeWithSystem } from "../components/useTime";

export default {
    install(app: App) {
        const time = createTime()
        bindTime(time)

        provideTime(time, app)
    },
}

function bindTime(time: TimeRef) {
    const debugNow = getTimeTravelHook(new URL(location.toString()).searchParams.get("t") || "")

    if (!debugNow) {
        syncTimeWithSystem(time)
        return
    }

    console.warn("Using time travel debug to", debugNow);
    time.timestamp = debugNow.getTime()

    Object.defineProperty(window, 'ttNow', {
        get: () => time.timestamp,
        set: (value: number) => time.timestamp = value,
    })
}

function getTimeTravelHook(str: string): Date | null {
    if (!str) return null
    try {
        const date = new Date(str)
        if (isNaN(date.getTime())) throw new Error("Invalid date spec")

        return date
    } catch (e) {
        console.error("error during attempt to parse time travel", str, e)
    }
    return null
}
