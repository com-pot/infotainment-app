import { defineDataProvider } from "@com-pot/infotainment-app/panels/dataProviders";
import { ModelState } from "@typeful/model";
import { ProgramScheduleItem } from "@com-pot/schedule/model/ProgramScheduleItem";
import { OccurrenceLocation } from "@com-pot/schedule/model/OccurrenceLocation";
import { OccurrenceItemRawData, ProgramItemOccurence } from "libs/com-pot/schedule/src/model/ProgramItemOccurrence";

import { FromSchema } from "json-schema-to-ts";
import * as tinyduration from "tinyduration"

const argsSchema = {
    type: 'object',
    properties: {
        from: {type: 'string', format: 'date'},
        to: {type: 'string', format: 'date'},
    },
    required: ['from', 'to'],
} as const
type Args = FromSchema<typeof argsSchema> & {now: Date}

export default defineDataProvider<any, Args>({
    async load(args) {
        let now = args.now || new Date()

        const [
            activities,
            locations,
            occurrencesRaw,
        ] = await Promise.all([
            this.api.req<{items: ProgramScheduleItem['app'][]}>('GET', 'backstage/typeful/collection/_compot_schedule__Activities/items?_perPage=100&meet=fhp'),
            this.api.req<{items: OccurrenceLocation['app'][]}>('GET', 'backstage/typeful/collection/_compot_locations__Places/items?_perPage=100&meet=fhp'),
            this.api.req<{items: OccurrencePersistedData[]}>('GET', 'backstage/typeful/collection/_compot_schedule__ActivityOccurrences/items?_perPage=150&meet=fhp'),
        ])

        const hydrator = createOccurrencesHydrator(new Date(args.from))

        const groups = hydrator.hydrateOccurrences(occurrencesRaw.items, activities.items, locations.items, now)

        const item = groups[0]?.items?.[0]
        if (item) {
            const refreshAt = item.time.end || item.time.start
            if (refreshAt) {
                const timeoutMs = refreshAt.getTime() - now.getTime()
                console.log("refresh after", timeoutMs)
                setTimeout(() => {
                    window.location.reload()
                }, timeoutMs)
            }
        }

        return groups
    },
})

export type ProgramEntriesGroup<TState extends ModelState = 'app'> = {
    date: Date,
    items: ProgramItemOccurence[TState][],
}

function createOccurrencesHydrator(startDate: Date) {
    const makeDate = (day: number, time?: string) => {
        if (!time) {
            return undefined
        }

        const date = new Date()
        const timeObj = tinyduration.parse('PT' + time.split(':').join('H') + 'M') // 🐷

        date.setFullYear(startDate.getFullYear(), startDate.getMonth(), startDate.getDate() + day)
        date.setHours(timeObj.hours || 0, timeObj.minutes)

        return date
    }

    const makeOccurenceTime = (range: string[], iDay: number): ProgramItemOccurence['app']['time'] => {
        return {start: makeDate(iDay, range[0])!, end: makeDate(iDay, range[1])}
    }

    const createOccurrencesGroup = (
        group: OccurrenceItemRawData[], iDay: number,
        activities: ProgramScheduleItem['app'][],
        locations: OccurrenceLocation['app'][],
        now?: Date,
    ): ProgramEntriesGroup | null => {
        const itemsOrInvalid = group
            .map((occurrence: OccurrenceItemRawData, iOcc): ProgramEntriesGroup['items'][number]|null => {
                const item = activities.find((item) => item.id === occurrence.item || item.slug === occurrence.item)!
                const time = makeOccurenceTime(occurrence.time, iDay)
                if (!item || !time) {
                    console.error(`Invalid occurrence spec '${iDay}:${iOcc}'`, occurrence)
                    return null
                }
                const location = occurrence.location ? locations.find((location) => location.id === occurrence.location || location.slug === occurrence.location) : undefined
                if (occurrence.location && !location) {
                    console.warn(`Occurrence location '${occurrence.location}' not found in '${iDay}:${iOcc}'`);
                }

                if (now) {
                    const showUntil = time.end || time.start
                    if (showUntil < now) {
                        return null
                    }
                }

                return {
                    item,
                    time,
                    location,
                    params: occurrence.params,
                }
            })
        const items = itemsOrInvalid
            .filter(Boolean) as NonNullable<typeof itemsOrInvalid[number]>[]

        if (!items.length) {
            return null
        }

        const date = new Date(items[0].time.start)
        date.setHours(24, 0, 0, -1)

        return { date, items }
    }

    const hydrateOccurrences = (
        scheduleOccurences: OccurrencePersistedData[],
        activities: ProgramScheduleItem['app'][],
        locations: OccurrenceLocation['app'][],
        now?: Date,
    ): ProgramEntriesGroup[] => {
        const scheduleOccurencesGroupedByDay = groupOccurrencesByDay(scheduleOccurences)
        return scheduleOccurencesGroupedByDay
            .map((group, iDay) => createOccurrencesGroup(group, iDay, activities, locations, now))
            .filter((item): item is NonNullable<typeof item> => !!item)
    }

    return {
        hydrateOccurrences,
    }
}

type OccurrencePersistedData = {
    activity: OccurrenceItemRawData["item"],
    location: OccurrenceItemRawData["location"],
    day: number,
    start: OccurrenceItemRawData["time"][0],
    end: OccurrenceItemRawData["time"][1],

    params: OccurrenceItemRawData["params"],
}

function groupOccurrencesByDay(occurrences: OccurrencePersistedData[]) {
    const groups: Record<string, OccurrenceItemRawData[]> = {}

    occurrences.forEach((occurrence) => {
        if (!groups[occurrence.day]) groups[occurrence.day] = []
        groups[occurrence.day].push({
            item: occurrence.activity,
            location: occurrence.location,
            time: [occurrence.start, occurrence.end],
            params: occurrence.params,
        })
    })

    return Object.entries(groups)
        .map(([day, group]) => [Number(day), group] as const)
        .sort(([a], [b]) => a - b)
        .map(([day, group]) => group.sort((a, b) => {
            if (!a.time[0] || !b.time) return 0
            return a.time[0].localeCompare(b.time[0])
        }))
}
